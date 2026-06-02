"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type {
  AssessmentAnswers,
  Question,
  QuestionsResponse,
  ScoreBandKey,
} from "@/lib/types";
import { bandFromPercentage } from "@/lib/score";
import { formatDate } from "@/lib/format";
import {
  BandBadge,
  ErrorState,
  LoadingState,
  ScoreRing,
  SectionBreakdown,
} from "@/shared/components";
import { SCORE_META } from "../components/score-selector";
import { useAssessmentAnswers, useQuestions } from "../hooks";

const LEVEL_META = new Map<number, (typeof SCORE_META)[number]>(
  SCORE_META.map((meta) => [meta.value, meta]),
);

function Stars({ level }: { level: number }) {
  const filled = Math.max(0, Math.min(5, level));
  return (
    <span className="tracking-[0.14em] text-[var(--warning)]" aria-hidden="true">
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
    </span>
  );
}

interface AnswerRow {
  questionKey: string;
  text: string;
  level: number;
  label: string;
  description: string;
}

interface AnswerGroup {
  sectionKey: string;
  label: string;
  rows: AnswerRow[];
}

/** Group the user's answers by section, in the questionnaire's own order. */
function buildGroups(
  answers: AssessmentAnswers,
  questions: QuestionsResponse | undefined,
): AnswerGroup[] {
  if (!questions) return [];
  const answerMap = new Map(
    answers.questionAnswers.map((item) => [item.questionKey, item.answer]),
  );

  return questions.sections
    .map((section) => {
      const rows: AnswerRow[] = [];
      for (const question of section.questions as Question[]) {
        const level = answerMap.get(question.questionKey);
        if (level == null) continue;
        const example = question.examples?.find((e) => e.level === level);
        rows.push({
          questionKey: question.questionKey,
          text: question.text,
          level,
          label: example?.label ?? String(level),
          description: example?.description ?? "",
        });
      }
      return { sectionKey: section.sectionKey, label: section.label, rows };
    })
    .filter((group) => group.rows.length > 0);
}

function profileBits(answers: AssessmentAnswers) {
  const profile = answers.familyProfile;
  const location = [profile?.city, profile?.state].filter(Boolean).join(", ");
  return {
    location: location || null,
    age: profile?.age != null ? `Age ${profile.age}` : null,
    members:
      profile?.familySize != null
        ? `${profile.familySize} member${profile.familySize === 1 ? "" : "s"}`
        : null,
  };
}

export function HistoryDetailContainer() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? null;

  const answersQuery = useAssessmentAnswers(id);
  const questionsQuery = useQuestions();

  const answers = answersQuery.data;
  const groups = useMemo(
    () => (answers ? buildGroups(answers, questionsQuery.data) : []),
    [answers, questionsQuery.data],
  );

  const backLink = (
    <Link
      href={ROUTES.history}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] outline-none transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--primary)]"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to history
    </Link>
  );

  if (answersQuery.isLoading || questionsQuery.isLoading) {
    return (
      <div className="space-y-6">
        {backLink}
        <LoadingState label="Loading your answers…" />
      </div>
    );
  }

  if (answersQuery.isError || !answers) {
    return (
      <div className="space-y-6">
        {backLink}
        <ErrorState
          title="Couldn't load this assessment"
          error={answersQuery.error}
          onRetry={() => answersQuery.refetch()}
        />
      </div>
    );
  }

  const band: ScoreBandKey =
    answers.scoreBand ?? bandFromPercentage(answers.scorePercentage);
  const coreMax = answers.sectionScores
    .filter((section) => !section.isBonus)
    .reduce((total, section) => total + section.maxScore, 0);
  const weakest = answers.sectionScores.reduce<typeof answers.sectionScores[number] | null>(
    (lowest, section) =>
      !lowest || section.sectionPercent < lowest.sectionPercent ? section : lowest,
    null,
  );
  const { location, age, members } = profileBits(answers);

  return (
    <div className="space-y-6">
      {backLink}

      {/* Score summary */}
      <section className="app-card flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:p-7 sm:text-left">
        <ScoreRing value={answers.scorePercentage} band={band} size={140} />
        <div className="space-y-2.5">
          <p className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Assessment — {formatDate(answers.completedAt)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <BandBadge band={band} label={answers.bandLabel} size="lg" />
            <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
              Core {answers.coreScore}
              {coreMax > 0 ? ` / ${coreMax}` : ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)] sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDate(answers.completedAt)}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />
                {location}
              </span>
            )}
            {(age || members) && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" aria-hidden="true" />
                {[age, members].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Section scores */}
      <section className="app-card space-y-5 p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Section scores
        </h2>
        <SectionBreakdown
          sections={answers.sectionScores}
          weakestKey={weakest?.sectionKey}
        />
      </section>

      {/* Answers */}
      <div className="space-y-2">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Your answers
        </h2>
        {groups.length === 0 ? (
          <p className="app-card p-6 text-sm text-[var(--text-muted)]">
            Answers for this assessment aren&apos;t available.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.sectionKey} className="app-card space-y-4 p-5 sm:p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                {group.label}
              </h3>
              <ul className="space-y-4">
                {group.rows.map((row) => {
                  const color = LEVEL_META.get(row.level)?.color ?? "var(--text-secondary)";
                  return (
                    <li
                      key={row.questionKey}
                      className="space-y-1.5 border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0"
                    >
                      <p className="text-[15px] font-medium leading-snug text-[var(--text-primary)]">
                        {row.text}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <Stars level={row.level} />
                        <span
                          className="text-sm font-semibold"
                          style={{ color }}
                        >
                          {row.level} — {row.label}
                        </span>
                      </p>
                      {row.description && (
                        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                          “{row.description}”
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Sparkles, Trophy } from "lucide-react";
import {
  ROUTES,
  SECTION_LABELS,
  SECTION_ORDER,
  type SectionKey,
} from "@/config/constants";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FlowShell } from "@/shared/layout";
import { ErrorState, LoadingState } from "@/shared/components";
import { assessmentApi } from "../api";
import {
  useCompleteAssessment,
  useQuestions,
  useResolveAssessmentId,
  useSaveSection,
} from "../hooks";
import { QuestionCard } from "../components/question-card";

function isValidSectionKey(key: string): key is SectionKey {
  return (SECTION_ORDER as readonly string[]).includes(key);
}

export function SectionContainer() {
  const params = useParams<{ sectionKey: string }>();
  const sectionKey = (params.sectionKey ?? "").toUpperCase();
  const router = useRouter();

  const questionsQuery = useQuestions();
  const { assessmentId, isResolving, isMissing } = useResolveAssessmentId();
  const saveSection = useSaveSection();
  const complete = useCompleteAssessment();

  // Keying answers + invalid-tries by section key keeps prior choices when
  // the user navigates back and avoids a stale-reset useEffect.
  const [answersBySection, setAnswersBySection] = useState<
    Record<string, Record<string, number>>
  >({});
  const [invalidShownFor, setInvalidShownFor] = useState<Set<string>>(
    () => new Set(),
  );
  const [bonusOpen, setBonusOpen] = useState(false);
  const [coreScore, setCoreScore] = useState(0);

  const answers = useMemo(
    () => answersBySection[sectionKey] ?? {},
    [answersBySection, sectionKey],
  );
  const showInvalid = invalidShownFor.has(sectionKey);

  const validKey = isValidSectionKey(sectionKey);

  useEffect(() => {
    if (!validKey) router.replace(ROUTES.assessmentSection("SLEEP"));
  }, [validKey, router]);

  useEffect(() => {
    if (isMissing) router.replace(ROUTES.welcome);
  }, [isMissing, router]);

  if (questionsQuery.isLoading || isResolving) {
    return (
      <FlowShell width="wide">
        <LoadingState label="Loading your questions…" />
      </FlowShell>
    );
  }

  if (questionsQuery.isError) {
    return (
      <FlowShell width="wide">
        <ErrorState
          error={questionsQuery.error}
          onRetry={() => questionsQuery.refetch()}
        />
      </FlowShell>
    );
  }

  const section = questionsQuery.data?.sections.find(
    (item) => item.sectionKey === sectionKey,
  );

  if (!validKey || isMissing || !assessmentId) {
    return (
      <FlowShell width="wide">
        <LoadingState label="Preparing…" />
      </FlowShell>
    );
  }

  if (!section) {
    return (
      <FlowShell width="wide">
        <ErrorState title="Section unavailable" />
      </FlowShell>
    );
  }

  const totalSections = questionsQuery.data?.meta.totalSections ?? 9;
  const answeredCount = section.questions.filter(
    (q) => answers[q.questionKey] != null,
  ).length;
  const allAnswered = answeredCount === section.questions.length;
  const unansweredCount = section.questions.length - answeredCount;
  const flowProgress = ((section.order - 1) / totalSections) * 100;
  const isCulture = sectionKey === "CULTURE";

  const sectionIndex = SECTION_ORDER.indexOf(sectionKey);
  const backHref =
    sectionIndex > 0
      ? ROUTES.assessmentSection(SECTION_ORDER[sectionIndex - 1])
      : ROUTES.onboardingProfile;

  const busy = saveSection.isPending || complete.isPending;

  const runComplete = () => {
    setBonusOpen(false);
    complete.mutate(assessmentId, {
      onSuccess: () => router.push(ROUTES.assessmentResult),
      onError: async () => {
        try {
          const active = await assessmentApi.getActive();
          const missing = active?.unansweredCoreSections ?? [];
          if (missing.length) {
            router.replace(ROUTES.assessmentSection(missing[0]));
          }
        } catch {
          /* toast already surfaced by the mutation hook */
        }
      },
    });
  };

  // Jump to (and visibly flag) the first unanswered question. Centres it, moves
  // focus there for keyboard/SR users, and replays an attention pulse — even if
  // the same card is targeted twice in a row.
  const goToFirstUnanswered = () => {
    const first = section.questions.find((q) => answers[q.questionKey] == null);
    if (!first) return;
    const el = document.getElementById(`question-${first.questionKey}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
    el.classList.remove("animate-attention");
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add("animate-attention");
  };

  const handleNext = () => {
    if (!allAnswered) {
      setInvalidShownFor((prev) => {
        if (prev.has(sectionKey)) return prev;
        const next = new Set(prev);
        next.add(sectionKey);
        return next;
      });
      goToFirstUnanswered();
      return;
    }

    const payload = section.questions.map((q) => ({
      questionKey: q.questionKey,
      score: answers[q.questionKey],
    }));

    saveSection.mutate(
      { assessmentId, sectionKey, answers: payload },
      {
        onSuccess: ({ nextSection, progress }) => {
          if (!isCulture && nextSection === "CULTURE") {
            setCoreScore(progress.coreScorePercentage);
            setBonusOpen(true);
            return;
          }
          if (nextSection) {
            router.push(ROUTES.assessmentSection(nextSection));
            return;
          }
          runComplete();
        },
      },
    );
  };

  return (
    <FlowShell progress={flowProgress} exitHref={ROUTES.dashboard} width="wide">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              Section {section.order} of {totalSections}
            </span>
            <span className="text-xs font-medium tabular-nums text-[var(--text-muted)]">
              {answeredCount}/{section.questions.length} answered
            </span>
          </div>
          <h1 className="text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {SECTION_LABELS[sectionKey]}
          </h1>
          {section.isBonus && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cat-violet-soft)] px-3 py-1 text-xs font-semibold text-[var(--cat-violet)]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Bonus Section — does not affect your main score
            </span>
          )}
        </div>

        <div className="space-y-3">
          {section.questions.map((question, index) => (
            <div
              key={question.questionKey}
              id={`question-${question.questionKey}`}
              tabIndex={-1}
              className="scroll-mt-24 rounded-[var(--radius-lg)] outline-none"
            >
              <QuestionCard
                question={question}
                index={index}
                value={answers[question.questionKey] ?? null}
                onChange={(score) =>
                  setAnswersBySection((prev) => ({
                    ...prev,
                    [sectionKey]: {
                      ...(prev[sectionKey] ?? {}),
                      [question.questionKey]: score,
                    },
                  }))
                }
                invalid={showInvalid && answers[question.questionKey] == null}
              />
            </div>
          ))}
        </div>

        {showInvalid && !allAnswered && (
          <div className="flex justify-center" aria-live="polite">
            <button
              type="button"
              onClick={goToFirstUnanswered}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--destructive)] transition-colors duration-150 hover:bg-[var(--error-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {unansweredCount === 1
                ? "1 question still needs an answer — tap to jump to it"
                : `${unansweredCount} questions still need an answer — tap to jump to the first`}
            </button>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(backHref)}
            disabled={busy}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleNext}
            isLoading={busy}
          >
            {isCulture ? "Finish & see results" : "Next section"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Dialog
        open={bonusOpen}
        onOpenChange={(open) => !busy && setBonusOpen(open)}
      >
        <DialogContent className="max-w-md" showCloseButton={!busy}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-[var(--warning)]" aria-hidden="true" />
              Core sections complete
            </DialogTitle>
            <DialogDescription>
              Your current core score is{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {coreScore}%
              </span>
              . The final bonus section is optional and won&apos;t change your main
              score.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-[var(--text-muted)]">
              Add the bonus section on family health culture for a fuller picture.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={() => {
                setBonusOpen(false);
                router.push(ROUTES.assessmentSection("CULTURE"));
              }}
              disabled={complete.isPending}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Continue to bonus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FlowShell>
  );
}

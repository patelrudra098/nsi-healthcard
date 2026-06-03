"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Target, Trash2 } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { ScoreBandKey } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { notifySuccess } from "@/lib/notify";
import { useAssessmentAnswers, useQuestions } from "@/features/assessment";
import { Button } from "@/shared/ui/button";
import {
  BandBadge,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHeader,
  PlanSummary,
  ProfileSummary,
  ScoreRing,
  SectionBreakdown,
} from "@/shared/components";
import { QuestionAnswers } from "../components/question-answers";
import { useAdminAssessment, useDeleteAssessment } from "../hooks";

export function AdminAssessmentDetailContainer() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id ?? "";
  const query = useAdminAssessment(id);
  const questionsQuery = useQuestions();
  const answersQuery = useAssessmentAnswers(id);
  const deleteAssessment = useDeleteAssessment();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmDelete = () => {
    deleteAssessment.mutate(id, {
      onSuccess: () => {
        notifySuccess("Assessment deleted");
        router.push(ROUTES.adminAssessments);
      },
    });
  };

  if (query.isLoading) return <LoadingState label="Loading assessment…" />;
  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }
  if (!query.data) return <ErrorState title="Assessment not found" />;

  const data = query.data;
  const band = data.scoreBand as ScoreBandKey;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={ROUTES.adminAssessments}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            All assessments
          </Link>
        </Button>
        <PageHeader
          title="Assessment detail"
          description={
            <>
              By{" "}
              <Link
                href={ROUTES.adminUser(data.user.id)}
                className="font-medium text-[var(--primary)] hover:underline"
              >
                {data.user.name}
              </Link>{" "}
              · +91 {data.user.mobile} · {formatDate(data.completedAt)}
            </>
          }
          actions={
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="app-card flex flex-col items-center justify-center gap-4 p-6 text-center">
          <ScoreRing value={data.scorePercentage} band={band} size={168} />
          <div className="space-y-1.5">
            <BandBadge band={band} label={data.bandLabel} size="lg" />
            <p className="text-pretty text-sm text-[var(--text-muted)]">
              {data.bandDescription}
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Sparkles className="size-3.5 text-[var(--cat-violet)]" aria-hidden="true" />
              Bonus {data.bonusPercentage}%
            </p>
          </div>
        </section>

        <section className="app-card space-y-5 p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Section breakdown
          </h2>
          {data.weakestSection && (
            <div
              className="flex items-start gap-3 rounded-[var(--radius-md)] px-4 py-3"
              style={{ backgroundColor: "var(--warning-soft)" }}
            >
              <Target className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              <p className="text-sm text-[var(--text-secondary)]">
                Weakest area:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {data.weakestSection.label} ({data.weakestSection.sectionPercent}%)
                </span>
              </p>
            </div>
          )}
          <SectionBreakdown
            sections={data.sectionScores}
            weakestKey={data.weakestSection?.sectionKey}
          />
        </section>
      </div>

      {data.familyProfile && (
        <section className="app-card space-y-4 p-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Family profile
          </h2>
          <ProfileSummary profile={data.familyProfile} />
        </section>
      )}

      <section className="app-card space-y-5 p-6">
        <div>
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Question answers
          </h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Every answer this member gave, grouped by section.
          </p>
        </div>
        {questionsQuery.isLoading || answersQuery.isLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading answers…</p>
        ) : questionsQuery.data && answersQuery.data ? (
          <QuestionAnswers
            questions={questionsQuery.data}
            answers={answersQuery.data.questionAnswers}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Answers are unavailable for this assessment.
          </p>
        )}
      </section>

      {data.improvementPlan && (
        <section className="app-card space-y-4 p-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Improvement plan
          </h2>
          <PlanSummary plan={data.improvementPlan} />
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
        title="Delete assessment?"
        description={`This permanently removes ${data.user.name}'s assessment. This cannot be undone.`}
        confirmLabel="Delete assessment"
        destructive
        loading={deleteAssessment.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

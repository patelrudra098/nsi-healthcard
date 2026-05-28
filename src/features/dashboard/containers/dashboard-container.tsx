"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ClipboardPlus,
  History,
  PlayCircle,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { AssessmentResult, ScoreBandKey } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/shared/ui/button";
import {
  BandBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PlanSummary,
  ScoreRing,
  SectionBreakdown,
  StatCard,
} from "@/shared/components";
import { assessmentApi, useAssessmentStore } from "@/features/assessment";
import { useDashboard } from "../hooks";

export function DashboardContainer() {
  const router = useRouter();
  const dashboard = useDashboard();
  const setAssessmentId = useAssessmentStore((s) => s.setAssessmentId);
  const setResult = useAssessmentStore((s) => s.setResult);
  const [resuming, setResuming] = useState(false);

  if (dashboard.isLoading) return <LoadingState label="Loading your dashboard…" />;
  if (dashboard.isError) {
    return <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />;
  }

  const data = dashboard.data;
  if (!data) return <ErrorState />;

  const { user, latestAssessment, assessmentHistory, stats } = data;
  const firstName = user.name.split(" ")[0];

  const handleResume = async () => {
    setResuming(true);
    try {
      const active = await assessmentApi.getActive();
      if (!active) {
        router.push(ROUTES.welcome);
        return;
      }
      setAssessmentId(active.assessmentId);
      if (!active.familyProfileCompleted) {
        router.push(ROUTES.onboardingProfile);
        return;
      }
      const nextSection = active.unansweredCoreSections[0] ?? "CULTURE";
      router.push(ROUTES.assessmentSection(nextSection));
    } finally {
      setResuming(false);
    }
  };

  const openPlan = (assessment: AssessmentResult) => {
    setAssessmentId(assessment.assessmentId);
    setResult(assessment);
    router.push(ROUTES.improvementPlan);
  };

  // ── Empty state: no completed assessment yet ──────────────────────────
  if (!latestAssessment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Welcome, ${firstName}`}
          description="Let's measure your family's health habits across 9 lifestyle areas."
        />
        <div className="app-card p-8">
          <EmptyState
            icon={ClipboardPlus}
            title="Start your first health assessment"
            description="It takes about 5 minutes. Answer honestly to get a clear, private snapshot of your family's wellbeing."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                {stats.hasActiveAssessment && (
                  <Button
                    variant="outline"
                    onClick={handleResume}
                    isLoading={resuming}
                  >
                    <PlayCircle className="size-4" aria-hidden="true" />
                    Resume assessment
                  </Button>
                )}
                <Button onClick={() => router.push(ROUTES.welcome)}>
                  <Plus className="size-4" aria-hidden="true" />
                  Start health assessment
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  const latest = latestAssessment;
  const band = latest.scoreBand as ScoreBandKey;
  const trend = stats.scoreTrend;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Here's your family's latest health snapshot."
        actions={
          <>
            {stats.hasActiveAssessment && (
              <Button variant="outline" onClick={handleResume} isLoading={resuming}>
                <PlayCircle className="size-4" aria-hidden="true" />
                Resume
              </Button>
            )}
            <Button onClick={() => router.push(ROUTES.welcome)}>
              <Plus className="size-4" aria-hidden="true" />
              New assessment
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="app-card flex flex-col items-center justify-center gap-4 p-6 text-center lg:col-span-1">
          <ScoreRing value={latest.scorePercentage} band={band} size={172} />
          <div className="space-y-1.5">
            <BandBadge band={band} label={latest.bandLabel} size="lg" />
            <p className="text-pretty text-sm text-[var(--text-muted)]">
              {latest.bandDescription}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Completed {formatDate(latest.completedAt)}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-2 lg:content-start">
          <StatCard
            label="Completed assessments"
            value={stats.totalCompletedAssessments}
            icon={ClipboardList}
            accent="blue"
          />
          <StatCard
            label="Bonus score"
            value={`${latest.bonusPercentage}%`}
            icon={Sparkles}
            accent="violet"
          />
          <StatCard
            label="Score trend"
            value={
              trend == null
                ? "—"
                : `${trend > 0 ? "+" : ""}${trend}%`
            }
            hint={
              trend == null
                ? "First assessment"
                : trend > 0
                  ? "Improved since last time"
                  : trend < 0
                    ? "Down since last time"
                    : "No change"
            }
            icon={trend != null && trend < 0 ? TrendingDown : TrendingUp}
            accent={trend == null ? "neutral" : trend < 0 ? "red" : "green"}
          />
          <StatCard
            label="Core score"
            value={`${latest.scorePercentage}%`}
            icon={ClipboardList}
            accent="cyan"
          />
        </div>
      </div>

      <section className="app-card space-y-5 p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Section breakdown
        </h2>
        <SectionBreakdown
          sections={latest.sectionScores}
          weakestKey={latest.weakestSection?.sectionKey}
        />
      </section>

      <section className="app-card space-y-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Improvement plan
          </h2>
          {!latest.improvementPlan && (
            <Button variant="outline" size="sm" onClick={() => openPlan(latest)}>
              <Plus className="size-4" aria-hidden="true" />
              Add plan
            </Button>
          )}
        </div>
        {latest.improvementPlan ? (
          <PlanSummary plan={latest.improvementPlan} />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            You haven&apos;t written an improvement plan for this assessment yet.
            Capture one habit to start improving today.
          </p>
        )}
      </section>

      {assessmentHistory.length > 1 && (
        <section className="app-card space-y-4 p-6">
          <div className="flex items-center gap-2">
            <History className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
              Assessment history
            </h2>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {assessmentHistory.map((item) => (
              <li
                key={item.assessmentId}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {formatDate(item.completedAt)}
                </span>
                <span className="flex items-center gap-3">
                  <BandBadge
                    band={item.scoreBand as ScoreBandKey}
                    label={item.bandLabel}
                    size="sm"
                  />
                  <span className="font-heading text-base font-bold tabular-nums text-[var(--text-primary)]">
                    {item.scorePercentage}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

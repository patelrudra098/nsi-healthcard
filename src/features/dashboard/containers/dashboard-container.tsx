"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ClipboardPlus,
  History,
  LineChart as LineChartIcon,
  PlayCircle,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { ScoreBandKey, ScoreHistoryEntry } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/shared/ui/button";
import {
  BandBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ScoreRing,
  SectionBreakdown,
  StatCard,
} from "@/shared/components";
import {
  assessmentApi,
  useAssessmentResult,
  useAssessmentStore,
} from "@/features/assessment";
import {
  CheckInSheet,
  HabitTrackerWidget,
  ProgressComparison,
  ReassessBanner,
  ScoreHistoryChart,
  useActiveHabitPlan,
  useScoreHistory,
} from "@/features/habit-plan";
import { useDashboard } from "../hooks";

export function DashboardContainer() {
  const router = useRouter();
  const dashboard = useDashboard();
  const planQuery = useActiveHabitPlan();
  const scoreHistoryQuery = useScoreHistory();
  const setAssessmentId = useAssessmentStore((s) => s.setAssessmentId);
  const [resuming, setResuming] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);

  const data = dashboard.data;
  const history = useMemo(
    () => data?.assessmentHistory ?? [],
    [data?.assessmentHistory],
  );

  // Oldest completed assessment — used for the section-by-section "most improved".
  const earliestId = useMemo(() => {
    if (history.length < 2) return null;
    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );
    const earliest = sorted[0];
    return earliest.assessmentId === data?.latestAssessment?.assessmentId
      ? null
      : earliest.assessmentId;
  }, [history, data?.latestAssessment?.assessmentId]);

  const firstResultQuery = useAssessmentResult(earliestId);

  // Prefer the dedicated score-history endpoint; fall back to assessment history
  // so the chart still renders if the endpoint is empty or unavailable.
  const scoreData: ScoreHistoryEntry[] = useMemo(() => {
    const fromApi = scoreHistoryQuery.data ?? [];
    if (fromApi.length > 0) return fromApi;
    return history.map((item) => ({
      completedAt: item.completedAt,
      scorePercentage: item.scorePercentage,
      bandLabel: item.bandLabel,
      scoreBand: item.scoreBand as ScoreBandKey,
    }));
  }, [scoreHistoryQuery.data, history]);

  if (dashboard.isLoading) return <LoadingState label="Loading your dashboard…" />;
  if (dashboard.isError) {
    return <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />;
  }
  if (!data) return <ErrorState />;

  const { user, latestAssessment, assessmentHistory, stats } = data;
  const firstName = user.name.split(" ")[0];
  const plan = planQuery.data ?? null;

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
      {plan?.shouldReassess && (
        <ReassessBanner message={plan.encouragementMessage} />
      )}

      <PageHeader
        title={`Hello, ${firstName}`}
        description="Here's your family's latest health snapshot and your 21-day challenge."
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(ROUTES.history)}>
              <History className="size-4" aria-hidden="true" />
              Health history
            </Button>
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

        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:content-start">
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
            value={trend == null ? "—" : `${trend > 0 ? "+" : ""}${trend}%`}
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

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="app-card space-y-5 p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <LineChartIcon className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
              Score history
            </h2>
          </div>
          <ScoreHistoryChart data={scoreData} />
        </section>

        <div className="lg:col-span-1">
          <HabitTrackerWidget plan={plan} onCheckIn={() => setCheckInOpen(true)} />
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

      {firstResultQuery.data && (
        <ProgressComparison
          first={firstResultQuery.data.sectionScores}
          latest={latest.sectionScores}
        />
      )}

      {assessmentHistory.length > 1 && (
        <section className="app-card space-y-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
              <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
                Assessment history
              </h2>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push(ROUTES.history)}
            >
              View all
            </Button>
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

      {plan && (
        <CheckInSheet
          open={checkInOpen}
          onOpenChange={setCheckInOpen}
          plan={plan}
          onComplete={() => router.push(ROUTES.improvementPlan)}
        />
      )}
    </div>
  );
}

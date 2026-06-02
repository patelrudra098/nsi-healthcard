"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Sparkles, Target } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { ScoreBandKey } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/shared/ui/button";
import { FlowShell } from "@/shared/layout";
import {
  BandBadge,
  ErrorState,
  LoadingState,
  ScoreRing,
  SectionBreakdown,
} from "@/shared/components";
import {
  ChallengeReadyCard,
  primaryHabit,
  useActiveHabitPlan,
  useGenerateHabitPlan,
  useScoreHistory,
} from "@/features/habit-plan";
import {
  useAssessmentResult,
  useResolveAssessmentId,
} from "../hooks";
import { useAssessmentStore } from "../store";

export function ResultContainer() {
  const router = useRouter();
  const storeResult = useAssessmentStore((s) => s.result);
  const { assessmentId, isResolving, isMissing } = useResolveAssessmentId();

  const resultQuery = useAssessmentResult(storeResult ? null : assessmentId);
  const result = storeResult ?? resultQuery.data ?? null;
  const celebrated = useRef(false);
  const generatePlan = useGenerateHabitPlan();
  const generationStarted = useRef(false);

  const planQuery = useActiveHabitPlan();
  const scoreHistoryQuery = useScoreHistory();

  useEffect(() => {
    if (isMissing && !storeResult) router.replace(ROUTES.dashboard);
  }, [isMissing, storeResult, router]);

  // Kick off 21-day plan generation silently once the result is available.
  // The endpoint is idempotent, so failures (e.g. plan already exists) are ignored.
  useEffect(() => {
    const id = result?.assessmentId;
    if (!id || generationStarted.current) return;
    generationStarted.current = true;
    generatePlan.mutate(id);
  }, [result?.assessmentId, generatePlan]);

  useEffect(() => {
    if (!result || celebrated.current) return;
    celebrated.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fire = (originX: number) =>
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 42,
        origin: { x: originX, y: 0.3 },
        colors: ["#1568C0", "#0C7A4F", "#B5680A", "#6D28D9"],
      });
    fire(0.3);
    setTimeout(() => fire(0.7), 180);
  }, [result]);

  // Returning users (more than one completed assessment) see their improvement.
  const improvement = useMemo(() => {
    const history = [...(scoreHistoryQuery.data ?? [])].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );
    if (history.length < 2 || !result) return null;
    return {
      from: Math.round(history[history.length - 2].scorePercentage),
      to: Math.round(result.scorePercentage),
    };
  }, [scoreHistoryQuery.data, result]);

  if (isResolving || (assessmentId && !storeResult && resultQuery.isLoading)) {
    return (
      <FlowShell width="wide">
        <LoadingState label="Tallying your score…" />
      </FlowShell>
    );
  }

  if (!storeResult && resultQuery.isError) {
    return (
      <FlowShell width="wide">
        <ErrorState
          error={resultQuery.error}
          onRetry={() => resultQuery.refetch()}
        />
      </FlowShell>
    );
  }

  if (!result) {
    return (
      <FlowShell width="wide">
        <LoadingState label="Loading results…" />
      </FlowShell>
    );
  }

  const band = result.scoreBand as ScoreBandKey;
  const plan = planQuery.data ?? null;
  const focusHabit = plan ? primaryHabit(plan) : null;
  const planLoading = generatePlan.isPending || planQuery.isLoading;

  return (
    <FlowShell exitHref={ROUTES.dashboard} width="wide">
      <div className="space-y-8">
        <section className="app-card flex flex-col items-center gap-5 p-6 text-center sm:p-8">
          <p className="text-sm font-medium text-[var(--text-muted)]">
            Your Family Health Score
          </p>
          <ScoreRing value={result.scorePercentage} band={band} size={196} />
          <div className="space-y-2">
            <BandBadge band={band} label={result.bandLabel} size="lg" />
            <p className="text-pretty mx-auto max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
              {result.bandDescription}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-[var(--cat-violet)]" aria-hidden="true" />
              Bonus: <span className="font-semibold text-[var(--text-primary)]">{result.bonusPercentage}%</span>
            </span>
            <span>Completed {formatDate(result.completedAt)}</span>
          </div>
        </section>

        {/* The hero: hand the user their fresh 21-day round. */}
        <ChallengeReadyCard
          habit={focusHabit}
          loading={planLoading}
          improvement={improvement}
        />

        {!improvement && result.weakestSection && (
          <div
            className="flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5"
            style={{
              backgroundColor: "var(--warning-soft)",
              borderColor: "color-mix(in srgb, var(--warning) 25%, transparent)",
            }}
          >
            <Target className="mt-0.5 size-5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                Your weakest area:
              </span>{" "}
              {result.weakestSection.label} ({result.weakestSection.sectionPercent}%).
              This is where your first 21 days will focus.
            </p>
          </div>
        )}

        <section className="app-card space-y-5 p-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Section breakdown
          </h2>
          <SectionBreakdown
            sections={result.sectionScores}
            weakestKey={result.weakestSection?.sectionKey}
          />
        </section>

        <div className="flex justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push(ROUTES.dashboard)}
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    </FlowShell>
  );
}

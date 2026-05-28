"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { ArrowRight, Sparkles, Target } from "lucide-react";
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

  useEffect(() => {
    if (isMissing && !storeResult) router.replace(ROUTES.dashboard);
  }, [isMissing, storeResult, router]);

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

        {result.weakestSection && (
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
              A great place to focus your improvement plan.
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

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            onClick={() => router.push(ROUTES.improvementPlan)}
            className="sm:min-w-[16rem]"
          >
            Create my improvement plan
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
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

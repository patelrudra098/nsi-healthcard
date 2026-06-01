"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/constants";
import type { AssessmentResult } from "@/lib/types";
import { notifySuccess } from "@/lib/notify";
import { FlowShell } from "@/shared/layout";
import { ErrorState } from "@/shared/components";
import type { ImprovementPlanBody } from "../api";
import {
  useAssessmentResult,
  useResolveAssessmentId,
  useSaveImprovementPlan,
} from "../hooks";
import { useAssessmentStore } from "../store";
import { PlanGenerating } from "../components/plan-generating";

/** Minimum on-screen time so the generation animation reads as intentional. */
const MIN_DURATION_MS = 2800;

/** Derive a starter plan from the score so we never ship an empty plan. */
function buildPlanBody(result: AssessmentResult | null): ImprovementPlanBody {
  if (!result) return {};
  const target = Math.min(100, Math.round(result.scorePercentage) + 10);
  return {
    biggestGap: result.weakestSection
      ? `${result.weakestSection.label} (${result.weakestSection.sectionPercent}%)`
      : undefined,
    targetScore: target,
  };
}

export function ImprovementPlanContainer() {
  const router = useRouter();
  const storeResult = useAssessmentStore((s) => s.result);
  const reset = useAssessmentStore((s) => s.reset);
  const { assessmentId, isResolving, isMissing } = useResolveAssessmentId();

  const resultQuery = useAssessmentResult(storeResult ? null : assessmentId);
  const result = storeResult ?? resultQuery.data ?? null;
  const savePlan = useSaveImprovementPlan();

  const startedRef = useRef(false);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    if (isMissing && !storeResult) router.replace(ROUTES.dashboard);
  }, [isMissing, storeResult, router]);

  // Keep the animation up for a beat even if the request returns instantly.
  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  // Kick off generation once the assessment (and result, if loading) is resolved.
  useEffect(() => {
    if (startedRef.current || !assessmentId) return;
    if (!storeResult && resultQuery.isLoading) return;
    startedRef.current = true;
    savePlan.mutate({ assessmentId, body: buildPlanBody(result) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, storeResult, resultQuery.isLoading]);

  // Finish once the plan is saved AND the animation has played its minimum.
  useEffect(() => {
    if (!savePlan.isSuccess || !minElapsed) return;
    notifySuccess("Your improvement plan is ready");
    reset();
    router.replace(ROUTES.dashboard);
  }, [savePlan.isSuccess, minElapsed, reset, router]);

  if (!isResolving && !assessmentId) {
    return (
      <FlowShell width="wide">
        <ErrorState title="No assessment found" />
      </FlowShell>
    );
  }

  if (savePlan.isError) {
    return (
      <FlowShell width="wide" exitHref={ROUTES.dashboard}>
        <ErrorState
          title="We couldn't create your plan"
          error={savePlan.error}
          onRetry={() => {
            savePlan.reset();
            if (assessmentId) {
              savePlan.mutate({ assessmentId, body: buildPlanBody(result) });
            }
          }}
        />
      </FlowShell>
    );
  }

  return (
    <FlowShell width="wide">
      <PlanGenerating />
    </FlowShell>
  );
}

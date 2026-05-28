"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Target } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { ScoreBandKey } from "@/lib/types";
import { notifySuccess } from "@/lib/notify";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { FlowShell } from "@/shared/layout";
import { BandBadge, ErrorState, LoadingState } from "@/shared/components";
import type { ImprovementPlanBody } from "../api";
import {
  useAssessmentResult,
  useResolveAssessmentId,
  useSaveImprovementPlan,
} from "../hooks";
import { useAssessmentStore } from "../store";
import { improvementPlanSchema, type ImprovementPlanInput } from "../types";

const FIELDS = [
  {
    name: "biggestGap",
    label: "Our biggest health gap is",
    placeholder: "Write the section where your family scored lowest…",
  },
  {
    name: "habitToImprove",
    label: "The one habit we must improve first",
    placeholder: "The single most impactful habit to start immediately…",
  },
  {
    name: "patternToReduce",
    label: "The harmful pattern we must reduce",
    placeholder: "Name one risk habit or pattern to eliminate…",
  },
  {
    name: "dailyFamilyHabit",
    label: "One health habit we will do together daily",
    placeholder: "Our daily family wellness commitment…",
  },
] as const;

export function ImprovementPlanContainer() {
  const router = useRouter();
  const storeResult = useAssessmentStore((s) => s.result);
  const reset = useAssessmentStore((s) => s.reset);
  const { assessmentId, isResolving, isMissing } = useResolveAssessmentId();

  const resultQuery = useAssessmentResult(storeResult ? null : assessmentId);
  const result = storeResult ?? resultQuery.data ?? null;
  const savePlan = useSaveImprovementPlan();

  const form = useForm<ImprovementPlanInput>({
    resolver: zodResolver(improvementPlanSchema),
    defaultValues: {
      biggestGap: "",
      habitToImprove: "",
      patternToReduce: "",
      dailyFamilyHabit: "",
      targetScore: "",
    },
  });

  useEffect(() => {
    if (isMissing && !storeResult) router.replace(ROUTES.dashboard);
  }, [isMissing, storeResult, router]);

  if (isResolving || (assessmentId && !storeResult && resultQuery.isLoading)) {
    return (
      <FlowShell width="wide">
        <LoadingState />
      </FlowShell>
    );
  }

  if (!assessmentId) {
    return (
      <FlowShell width="wide">
        <ErrorState title="No assessment found" />
      </FlowShell>
    );
  }

  const goDashboard = () => {
    reset();
    router.push(ROUTES.dashboard);
  };

  const onSubmit = (values: ImprovementPlanInput) => {
    const body: ImprovementPlanBody = {
      biggestGap: values.biggestGap?.trim() || undefined,
      habitToImprove: values.habitToImprove?.trim() || undefined,
      patternToReduce: values.patternToReduce?.trim() || undefined,
      dailyFamilyHabit: values.dailyFamilyHabit?.trim() || undefined,
      targetScore: values.targetScore ? Number(values.targetScore) : undefined,
    };

    savePlan.mutate(
      { assessmentId, body },
      {
        onSuccess: () => {
          notifySuccess("Improvement plan saved");
          goDashboard();
        },
      },
    );
  };

  return (
    <FlowShell exitHref={ROUTES.dashboard} width="wide">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Your improvement plan
          </h1>
          <p className="text-pretty mx-auto max-w-xl text-sm text-[var(--text-muted)]">
            Turn awareness into action. Everything here is optional, but writing
            it down makes it real.
          </p>
        </div>

        {result && (
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-[var(--radius-lg)] bg-[var(--muted)] px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="text-[var(--text-muted)]">Your score</span>
              <span className="font-heading text-base font-bold text-[var(--text-primary)]">
                {result.scorePercentage}%
              </span>
              <BandBadge band={result.scoreBand as ScoreBandKey} label={result.bandLabel} size="sm" />
            </span>
            {result.weakestSection && (
              <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                <Target className="size-4 text-[var(--warning)]" aria-hidden="true" />
                Focus: {result.weakestSection.label} ({result.weakestSection.sectionPercent}%)
              </span>
            )}
          </div>
        )}

        <div className="app-card space-y-5 p-6">
          {FIELDS.map((field) => (
            <Textarea
              key={field.name}
              label={field.label}
              placeholder={field.placeholder}
              rows={3}
              {...form.register(field.name)}
              error={form.formState.errors[field.name]?.message}
            />
          ))}

          <Input
            label={
              result
                ? `Our target score after 21 days (current: ${result.scorePercentage}%)`
                : "Our target score after 21 days"
            }
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            placeholder="Enter your target percentage (e.g. 85)"
            {...form.register("targetScore")}
            error={form.formState.errors.targetScore?.message}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={goDashboard}>
            Skip for now
          </Button>
          <Button type="submit" size="lg" isLoading={savePlan.isPending}>
            Complete &amp; go to dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </FlowShell>
  );
}

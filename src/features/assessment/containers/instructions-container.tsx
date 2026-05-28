"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ROUTES, SCORE_LEGEND } from "@/config/constants";
import { Button } from "@/shared/ui/button";
import { FlowShell } from "@/shared/layout";
import { useCreateAssessment } from "../hooks";

const RULES = [
  "Every question is scored from 1 to 5.",
  "Be completely honest — this is only for YOUR awareness.",
  "Score based on your family's CURRENT reality, not your ideal wish.",
  "This is an awareness lifestyle tool — NOT a medical diagnosis.",
  "Try completing this together as a family.",
] as const;

const LEGEND_COLORS: Record<number, string> = {
  5: "var(--success)",
  4: "var(--info)",
  3: "var(--warning)",
  2: "var(--cat-amber)",
  1: "var(--error)",
};

export function InstructionsContainer() {
  const router = useRouter();
  const createAssessment = useCreateAssessment();

  const handleStart = () => {
    createAssessment.mutate(undefined, {
      onSuccess: () => router.push(ROUTES.onboardingProfile),
    });
  };

  return (
    <FlowShell exitHref={ROUTES.dashboard} width="wide">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            How scoring works
          </h1>
          <p className="text-pretty mx-auto max-w-xl text-sm text-[var(--text-muted)]">
            A few ground rules before you begin. Read them, then start whenever
            you&apos;re ready.
          </p>
        </div>

        <div className="app-card p-6">
          <ul className="space-y-3.5">
            {RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-[var(--success)]"
                  aria-hidden="true"
                />
                <span className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  {rule}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="app-card overflow-hidden p-0">
          <div className="border-b border-[var(--border)] px-5 py-3">
            <h2 className="font-heading text-sm font-semibold text-[var(--text-primary)]">
              Score legend
            </h2>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {SCORE_LEGEND.map((item) => (
              <li
                key={item.score}
                className="flex items-center gap-4 px-5 py-3"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] font-heading text-base font-bold text-[var(--text-inverse)]"
                  style={{ backgroundColor: LEGEND_COLORS[item.score] }}
                >
                  {item.score}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    {item.label}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {item.meaning}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            onClick={handleStart}
            isLoading={createAssessment.isPending}
            className="w-full sm:w-auto"
          >
            I&apos;m Ready — Start
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </FlowShell>
  );
}

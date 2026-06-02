"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, Sparkles, Target, TrendingUp } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { PlannedHabit } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import { sectionIcon, sectionLabel } from "../constants";

interface ChallengeReadyCardProps {
  habit: PlannedHabit | null;
  loading: boolean;
  /** Present only for a returning user who just retook the assessment. */
  improvement?: { from: number; to: number } | null;
  /** The section completed in the previous round (returning user). */
  previousFocusLabel?: string | null;
}

/**
 * Post-assessment CTA that hands the user their fresh 21-day round. Two shapes:
 * first-ever ("your challenge is ready") and returning ("you improved + next").
 */
export function ChallengeReadyCard({
  habit,
  loading,
  improvement,
  previousFocusLabel,
}: ChallengeReadyCardProps) {
  const isReturning = Boolean(improvement);
  const focus = habit ? sectionLabel(habit.sectionKey) : null;
  const delta = improvement ? improvement.to - improvement.from : 0;

  return (
    <section className="app-card overflow-hidden p-0">
      <div
        className="px-6 py-5 sm:px-8"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-soft) 0%, color-mix(in srgb, var(--cat-violet-soft) 65%, var(--surface)) 100%)",
        }}
      >
        {isReturning && improvement ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--success)] text-[var(--text-inverse)]">
              <TrendingUp className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--success)]">
                Your score improved
              </p>
              <p className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                {improvement.from} → {improvement.to}
                <span className="ml-2 align-middle text-base font-bold text-[var(--success)]">
                  +{delta} point{delta === 1 ? "" : "s"}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[var(--text-inverse)]">
              <Target className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Your 21-day challenge is ready
              </p>
              <p className="font-heading text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
                We&apos;ve found your biggest opportunity
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {isReturning && previousFocusLabel && (
          <p className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <CircleCheck className="size-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
            Last challenge: {previousFocusLabel} —{" "}
            <span className="font-semibold text-[var(--success)]">Complete</span>
          </p>
        )}

        <div className="flex items-start gap-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-2xl"
            aria-hidden="true"
          >
            {habit ? sectionIcon(habit.sectionKey) : "🎯"}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {isReturning ? "New challenge" : "Your first focus"}
              {focus ? ` · ${focus}` : ""}
            </p>
            {loading && !habit ? (
              <span className="skeleton block h-5 w-3/4 rounded" aria-hidden="true" />
            ) : (
              <p className="text-pretty font-heading text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                {habit ? `“${habit.title}”` : "Building your personalised habit…"}
              </p>
            )}
          </div>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href={`${ROUTES.improvementPlan}?started=1`}>
            {isReturning ? "Start next 21-day challenge" : "Start my 21-day challenge"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

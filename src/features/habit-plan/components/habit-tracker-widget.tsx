"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Flame, Sparkles } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { HabitPlan } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components";
import { clampPercent } from "@/lib/score";
import {
  RATING_LABELS,
  RATING_STARS,
  ROUND_TOTAL_DAYS,
  activeHabits,
  isCheckInDue,
  roundDay,
  sectionIcon,
  toRating,
} from "../constants";
import { NextUp } from "./next-up";

/** Compact dashboard widget summarising the active 21-day challenge. */
export function HabitTrackerWidget({
  plan,
  onCheckIn,
}: {
  plan: HabitPlan | null;
  onCheckIn: () => void;
}) {
  if (!plan) {
    return (
      <section className="app-card p-6">
        <EmptyState
          icon={Sparkles}
          title="No active challenge yet"
          description="Complete your assessment to unlock a personalised 21-day challenge built around one focused habit."
          action={
            <Button asChild>
              <Link href={ROUTES.welcome}>
                Start assessment
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  const active = activeHabits(plan);
  const due = isCheckInDue(plan);
  const pct = clampPercent(plan.progressPercent);

  return (
    <section className="app-card space-y-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          21-day challenge
        </h2>
        <span className="shrink-0 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-medium tabular-nums text-[var(--text-muted)]">
          Day {roundDay(plan)} of {ROUND_TOTAL_DAYS}
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="21-day challenge progress"
      >
        <div
          className="h-full rounded-full bg-[var(--primary)] motion-reduce:transition-none"
          style={{ width: `${pct}%`, transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </div>

      <ul className="space-y-4">
        {active.map((habit) => {
          const rating = toRating(habit.lastWeekRating);
          return (
            <li key={habit.id} className="flex items-start gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-xl"
                aria-hidden="true"
              >
                {sectionIcon(habit.sectionKey)}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-medium leading-snug text-[var(--text-primary)]">
                  {habit.title}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-[var(--text-muted)]">
                  {rating != null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="tracking-[0.1em] text-[var(--warning)]" aria-hidden="true">
                        {RATING_STARS[rating]}
                      </span>
                      {RATING_LABELS[rating]}
                    </span>
                  ) : (
                    <span>No check-in yet</span>
                  )}
                  {habit.currentStreak >= 1 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--cat-amber)]">
                      <Flame className="size-3.5" aria-hidden="true" />
                      {habit.currentStreak} wk
                    </span>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <NextUp sections={plan.nextWeakSections} compact />

      {due && (
        <div
          className="flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3"
          style={{
            backgroundColor: "var(--warning-soft)",
            borderColor: "color-mix(in srgb, var(--warning) 25%, transparent)",
          }}
        >
          <CalendarClock className="size-5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
          <p className="flex-1 text-sm font-medium text-[var(--text-secondary)]">
            Your week {plan.currentWeek} check-in is due.
          </p>
          <Button size="sm" onClick={onCheckIn}>
            Check in now
          </Button>
        </div>
      )}

      <div className="border-t border-[var(--border)] pt-4">
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href={ROUTES.improvementPlan}>
            View full plan
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

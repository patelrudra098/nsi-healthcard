import { CalendarCheck, Flag, Sparkles } from "lucide-react";
import type { HabitPlan } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { clampPercent } from "@/lib/score";
import { ROUND_TOTAL_DAYS, roundDay } from "../constants";

const STATUS_COPY: Record<HabitPlan["status"], string> = {
  ACTIVE: "In progress",
  COMPLETED: "Completed",
  ABANDONED: "Paused",
};

/** Hero header for the 21-day challenge: dates, progress bar, day counter. */
export function JourneyHeader({ plan }: { plan: HabitPlan }) {
  const pct = clampPercent(plan.progressPercent);
  const totalDays = ROUND_TOTAL_DAYS;
  const dayLabel = roundDay(plan);

  return (
    <section className="app-card overflow-hidden p-0">
      <div
        className="relative px-6 pb-6 pt-7 sm:px-8 sm:pt-8"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-soft) 0%, color-mix(in srgb, var(--cat-violet-soft) 70%, var(--surface)) 100%)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Your 21-day habit challenge
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-[1.75rem]">
              One habit. Twenty-one days.
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] backdrop-blur-sm">
            {STATUS_COPY[plan.status]}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Flag className="size-4 text-[var(--primary)]" aria-hidden="true" />
            Started{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {formatDate(plan.startDate)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck className="size-4 text-[var(--success)]" aria-hidden="true" />
            Target{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {formatDate(plan.targetDate)}
            </span>
          </span>
        </div>
      </div>

      <div className="space-y-2 px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--text-primary)]">
            {pct}% complete
          </span>
          <span className="tabular-nums text-[var(--text-muted)]">
            Day {dayLabel} of {totalDays}
            {plan.daysRemaining > 0 && (
              <> · {plan.daysRemaining} days left</>
            )}
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="21-day challenge progress"
        >
          <div
            className="h-full rounded-full motion-reduce:transition-none"
            style={{
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, var(--primary) 0%, var(--cat-violet) 100%)",
              transition: "width 700ms cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ChevronRight, Sparkles, Star } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { AdminHabitPlanSummary, HabitPlanStatus } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { clampPercent } from "@/lib/score";
import { sectionLabel } from "@/features/habit-plan";
import { Badge } from "@/shared/ui/badge";

const STATUS_META: Record<
  HabitPlanStatus,
  { label: string; variant: "success" | "info" | "soft" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  COMPLETED: { label: "Completed", variant: "info" },
  ABANDONED: { label: "Abandoned", variant: "soft" },
};

function HabitPlanCard({ plan }: { plan: AdminHabitPlanSummary }) {
  const meta = STATUS_META[plan.status];
  const pct = clampPercent(plan.progressPercent);

  return (
    <Link
      href={ROUTES.adminHabitPlan(plan.planId)}
      className="group block rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 outline-none transition-colors hover:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={meta.variant} size="sm">
            {meta.label}
          </Badge>
          <span className="text-xs text-[var(--text-muted)]">
            Started {formatDate(plan.startDate)}
          </span>
        </div>
        <ChevronRight
          className="size-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>

      {plan.habits.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {plan.habits.map((key) => (
            <span
              key={key}
              className="inline-flex items-center rounded-full bg-[var(--primary-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]"
            >
              {sectionLabel(key)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--text-primary)]">
            {pct}% complete
          </span>
          <span className="inline-flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span className="tabular-nums">
              {plan.totalCheckIns} check-in{plan.totalCheckIns === 1 ? "" : "s"}
            </span>
            {plan.avgRating != null && (
              <span className="inline-flex items-center gap-1">
                <Star
                  className="size-3.5 fill-[var(--cat-amber)] text-[var(--cat-amber)]"
                  aria-hidden="true"
                />
                {plan.avgRating.toFixed(1)}
              </span>
            )}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full bg-[var(--primary)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

interface UserHabitPlansProps {
  plans: AdminHabitPlanSummary[];
  isLoading: boolean;
}

/** A user's habit challenges, newest first, each linking to its full plan. */
export function UserHabitPlans({ plans, isLoading }: UserHabitPlansProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-[var(--text-muted)]">Loading habit challenge…</p>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--text-muted)]">
        <Sparkles className="size-5 shrink-0 text-[var(--text-disabled)]" aria-hidden="true" />
        No habit challenge yet — one starts after this member completes an
        assessment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <HabitPlanCard key={plan.planId} plan={plan} />
      ))}
    </div>
  );
}

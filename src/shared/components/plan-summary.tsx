import { Target } from "lucide-react";
import type { ImprovementPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

const FIELDS: { key: keyof ImprovementPlan; label: string }[] = [
  { key: "biggestGap", label: "Biggest health gap" },
  { key: "habitToImprove", label: "Habit to improve first" },
  { key: "patternToReduce", label: "Harmful pattern to reduce" },
  { key: "dailyFamilyHabit", label: "Daily family habit" },
];

/** Read-only rendering of a saved improvement plan. */
export function PlanSummary({
  plan,
  className,
}: {
  plan: ImprovementPlan;
  className?: string;
}) {
  const entries = FIELDS.filter((field) => {
    const value = plan[field.key];
    return typeof value === "string" && value.trim().length > 0;
  });

  return (
    <div className={cn("space-y-4", className)}>
      {plan.targetScore != null && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--primary-soft)] px-4 py-3">
          <Target className="size-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <p className="text-sm text-[var(--text-secondary)]">
            Target score after 21 days:{" "}
            <span className="font-heading text-base font-bold text-[var(--primary)]">
              {plan.targetScore}%
            </span>
          </p>
        </div>
      )}

      {entries.length > 0 ? (
        <dl className="space-y-3">
          {entries.map((field) => (
            <div key={field.key}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {field.label}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {plan[field.key] as string}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        plan.targetScore == null && (
          <p className="text-sm text-[var(--text-muted)]">
            No reflections were recorded for this plan.
          </p>
        )
      )}
    </div>
  );
}

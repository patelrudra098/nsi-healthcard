import type { LucideIcon } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { cn } from "@/lib/utils";

export type StatAccent =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "cyan"
  | "neutral";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  accent?: StatAccent;
  className?: string;
}

const accentVar: Record<StatAccent, { fg: string; bg: string }> = {
  blue: { fg: "var(--icon-blue)", bg: "var(--icon-blue-bg)" },
  green: { fg: "var(--icon-green)", bg: "var(--icon-green-bg)" },
  amber: { fg: "var(--icon-amber)", bg: "var(--icon-amber-bg)" },
  red: { fg: "var(--icon-red)", bg: "var(--icon-red-bg)" },
  violet: { fg: "var(--icon-violet)", bg: "var(--icon-violet-bg)" },
  cyan: { fg: "var(--icon-cyan)", bg: "var(--icon-cyan-bg)" },
  neutral: { fg: "var(--icon-neutral)", bg: "var(--icon-neutral-bg)" },
};

/** Compact KPI tile used across dashboards. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "blue",
  className,
}: StatCardProps) {
  const colors = accentVar[accent];
  return (
    <Card padding="none" className={cn("app-card app-card-interactive p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium text-[var(--text-muted)]">
            {label}
          </p>
          <p className="font-heading text-2xl font-bold tabular-nums tracking-tight text-[var(--text-primary)]">
            {value}
          </p>
          {hint && (
            <p className="text-xs text-[var(--text-muted)]">{hint}</p>
          )}
        </div>
        {Icon && (
          <span
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
            style={{ backgroundColor: colors.bg, color: colors.fg }}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        )}
      </div>
    </Card>
  );
}

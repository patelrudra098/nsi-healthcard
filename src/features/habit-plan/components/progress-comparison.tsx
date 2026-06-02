import { ArrowUp, TrendingUp } from "lucide-react";
import type { SectionScoreResult } from "@/lib/types";
import { clampPercent } from "@/lib/score";

interface Improvement {
  key: string;
  label: string;
  from: number;
  to: number;
  delta: number;
}

function topImprovements(
  first: SectionScoreResult[],
  latest: SectionScoreResult[],
  limit = 3,
): Improvement[] {
  const firstByKey = new Map(first.map((s) => [s.sectionKey, s]));
  return latest
    .map((section) => {
      const before = firstByKey.get(section.sectionKey);
      const from = clampPercent(before?.sectionPercent ?? 0);
      const to = clampPercent(section.sectionPercent);
      return {
        key: section.sectionKey,
        label: section.label,
        from,
        to,
        delta: to - from,
      };
    })
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit);
}

/** "Most improved sections" — first vs. latest assessment. Renders nothing when flat. */
export function ProgressComparison({
  first,
  latest,
}: {
  first: SectionScoreResult[];
  latest: SectionScoreResult[];
}) {
  const improvements = topImprovements(first, latest);
  if (improvements.length === 0) return null;

  return (
    <section className="app-card space-y-5 p-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="size-5 text-[var(--success)]" aria-hidden="true" />
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Most improved sections
        </h2>
      </div>
      <ul className="space-y-3">
        {improvements.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] bg-[var(--surface-hover)] px-4 py-3"
          >
            <span className="min-w-0 truncate text-sm font-medium text-[var(--text-primary)]">
              {item.label}
            </span>
            <span className="flex shrink-0 items-center gap-3 text-sm tabular-nums">
              <span className="text-[var(--text-muted)]">
                {item.from}% → {item.to}%
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-[var(--success)]">
                <ArrowUp className="size-3.5" aria-hidden="true" />+{item.delta}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

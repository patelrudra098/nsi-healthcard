"use client";

import { useEffect, useState } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import type { SectionScoreResult } from "@/lib/types";
import { clampPercent, getPercentToken } from "@/lib/score";
import { cn } from "@/lib/utils";

interface SectionBreakdownProps {
  sections: SectionScoreResult[];
  weakestKey?: string | null;
  className?: string;
}

function SectionRow({
  section,
  isWeakest,
}: {
  section: SectionScoreResult;
  isWeakest: boolean;
}) {
  const pct = clampPercent(section.sectionPercent);
  const color = getPercentToken(pct);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <li className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--text-primary)]">
            {section.label}
          </span>
          {section.isBonus && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--cat-violet-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cat-violet)]">
              <Sparkles className="size-3" aria-hidden="true" />
              Bonus
            </span>
          )}
          {isWeakest && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
              <AlertTriangle className="size-3" aria-hidden="true" />
              Focus
            </span>
          )}
        </div>
        <span
          className="shrink-0 text-sm font-semibold tabular-nums"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={section.label}
      >
        <div
          className="h-full rounded-full motion-reduce:transition-none"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            transition: "width 700ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </li>
  );
}

/** Vertical list of section scores with animated bars and bonus/focus tags. */
export function SectionBreakdown({
  sections,
  weakestKey,
  className,
}: SectionBreakdownProps) {
  return (
    <ul className={cn("space-y-4", className)}>
      {sections.map((section) => (
        <SectionRow
          key={section.sectionKey}
          section={section}
          isWeakest={section.sectionKey === weakestKey}
        />
      ))}
    </ul>
  );
}

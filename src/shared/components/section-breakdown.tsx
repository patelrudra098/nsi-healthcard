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

function SectionTile({
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
    <li
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors duration-150",
        isWeakest
          ? "border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[var(--warning-soft)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-snug text-[var(--text-primary)]">
          {section.label}
        </span>
        <span
          className="shrink-0 font-heading text-lg font-bold leading-none tabular-nums"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
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

      {(section.isBonus || isWeakest) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {section.isBonus && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cat-violet-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cat-violet)]">
              <Sparkles className="size-3" aria-hidden="true" />
              Bonus
            </span>
          )}
          {isWeakest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
              <AlertTriangle className="size-3" aria-hidden="true" />
              Focus
            </span>
          )}
        </div>
      )}
    </li>
  );
}

/** Responsive bento grid of section scores — compact tiles with animated bars. */
export function SectionBreakdown({
  sections,
  weakestKey,
  className,
}: SectionBreakdownProps) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {sections.map((section) => (
        <SectionTile
          key={section.sectionKey}
          section={section}
          isWeakest={section.sectionKey === weakestKey}
        />
      ))}
    </ul>
  );
}

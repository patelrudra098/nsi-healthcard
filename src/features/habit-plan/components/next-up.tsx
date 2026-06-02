import { ArrowRight, Lock } from "lucide-react";
import type { NextWeakSection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { cleanLabel, sectionIcon } from "../constants";

interface NextUpProps {
  sections: NextWeakSection[];
  /** Dashboard mini-list variant. */
  compact?: boolean;
}

/**
 * "Coming Up Next" — a preview of the rounds the next assessment will unlock.
 * Rendered as locked, greyed cards; never interactive.
 */
export function NextUp({ sections, compact = false }: NextUpProps) {
  if (sections.length === 0) return null;
  const preview = sections.slice(0, 2);

  if (compact) {
    return (
      <div className="space-y-2.5 border-t border-[var(--border)] pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Coming up next
        </p>
        <ul className="space-y-2">
          {preview.map((section, index) => (
            <li
              key={section.sectionKey}
              className="flex items-center gap-2.5 text-sm"
            >
              <span className="text-base grayscale" aria-hidden="true">
                {sectionIcon(section.sectionKey)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">
                {cleanLabel(section.sectionLabel)}
              </span>
              <span className="shrink-0 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                Round {index + 2}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="app-card overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Coming up next
        </h2>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          After your 21-day challenge, we&apos;ll work on these next.
        </p>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {preview.map((section, index) => (
          <li
            key={section.sectionKey}
            className="flex items-start gap-4 px-5 py-4 sm:px-6"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-xl grayscale"
              aria-hidden="true"
            >
              {sectionIcon(section.sectionKey)}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Round {index + 2}
                </span>
                <span className="font-semibold text-[var(--text-secondary)]">
                  {cleanLabel(section.sectionLabel)}
                </span>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                  {section.sectionPercent}% score
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 truncate">{section.previewHabit}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p
        className={cn(
          "flex items-center justify-center gap-1.5 px-5 py-3.5 text-center text-sm font-medium text-[var(--text-muted)]",
          "border-t border-[var(--border)] bg-[var(--muted)]/40",
        )}
      >
        Complete your challenge to unlock these
        <ArrowRight className="size-4" aria-hidden="true" />
      </p>
    </section>
  );
}

import { Flame, Lightbulb, Lock } from "lucide-react";
import type { PlannedHabit } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_META,
  RATING_LABELS,
  RATING_STARS,
  sectionIcon,
  toRating,
} from "../constants";

function RoundChip({
  active,
  unlocksInDays,
}: {
  active: boolean;
  unlocksInDays?: number;
}) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
      {active ? "Your focus habit —" : "Next round —"}{" "}
      <span className={active ? "text-[var(--primary)]" : undefined}>
        {active
          ? "Active now"
          : unlocksInDays != null
            ? `Unlocks in ${unlocksInDays} day${unlocksInDays === 1 ? "" : "s"}`
            : "Locked"}
      </span>
    </p>
  );
}

function DifficultyBadge({ habit }: { habit: PlannedHabit }) {
  const meta = DIFFICULTY_META[habit.difficulty];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-wide",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

/** A single habit in the 90-day plan — full card when active, locked otherwise. */
export function HabitCard({ habit }: { habit: PlannedHabit }) {
  const icon = sectionIcon(habit.sectionKey);

  if (!habit.isActive) {
    return (
      <div className="space-y-3">
        <RoundChip active={false} unlocksInDays={habit.unlocksInDays} />
        <div className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--muted)]/40 p-5">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--surface)] text-xl grayscale"
            aria-hidden="true"
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {habit.sectionKey}
              </span>
              <DifficultyBadge habit={habit} />
            </div>
            <p className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
              <Lock className="size-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              {habit.title}
            </p>
            {habit.unlocksInDays != null && (
              <p className="text-xs text-[var(--text-muted)]">
                Unlocks in {habit.unlocksInDays} day
                {habit.unlocksInDays === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const rating = toRating(habit.lastWeekRating);

  return (
    <div className="space-y-3">
      <RoundChip active />
      <div className="app-card space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-2xl"
              aria-hidden="true"
            >
              {icon}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {habit.sectionKey}
            </span>
          </div>
          <DifficultyBadge habit={habit} />
        </div>

        <h3 className="font-heading text-lg font-semibold leading-snug text-[var(--text-primary)]">
          {habit.title}
        </h3>

        <p className="text-pretty text-sm leading-relaxed text-[var(--text-secondary)]">
          {habit.description}
        </p>

        <div
          className="flex items-start gap-2.5 rounded-[var(--radius-md)] p-3.5"
          style={{ backgroundColor: "var(--cat-amber-soft)" }}
        >
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-[var(--cat-amber)]" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              Why this matters:{" "}
            </span>
            {habit.whyItHelps}
          </p>
        </div>

        {(rating != null || habit.currentStreak >= 1) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-4 text-sm">
            {rating != null && (
              <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="text-[var(--text-muted)]">Last week:</span>
                <span className="tracking-[0.1em] text-[var(--warning)]" aria-hidden="true">
                  {RATING_STARS[rating]}
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {RATING_LABELS[rating]}
                </span>
              </span>
            )}
            {habit.currentStreak >= 1 && (
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--cat-amber)]">
                <Flame className="size-4" aria-hidden="true" />
                {habit.currentStreak} week{habit.currentStreak === 1 ? "" : "s"} streak
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

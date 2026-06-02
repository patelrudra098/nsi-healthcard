import { SECTION_LABELS, type SectionKey } from "@/config/constants";
import type {
  HabitDifficulty,
  HabitPlan,
  HabitRating,
  PlannedHabit,
} from "@/lib/types";

/** Emoji per section key — falls back to a neutral target when unknown. */
export const SECTION_ICONS: Record<string, string> = {
  SLEEP: "🌙",
  ENERGY: "⚡",
  HYDRATION: "💧",
  FOOD: "🥗",
  ACTIVITY: "🚶",
  STRESS: "🧘",
  RISK: "🚭",
  PREVENTIVE: "🏥",
  CULTURE: "👨‍👩‍👧",
};

export function sectionIcon(sectionKey: string): string {
  return SECTION_ICONS[sectionKey] ?? "🎯";
}

export const DIFFICULTY_META: Record<
  HabitDifficulty,
  { label: string; className: string }
> = {
  EASY: { label: "Easy", className: "bg-[var(--success-soft)] text-[var(--success)]" },
  MEDIUM: {
    label: "Medium",
    className: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  HARD: { label: "Hard", className: "bg-[var(--error-soft)] text-[var(--error)]" },
};

export const RATING_LABELS: Record<HabitRating, string> = {
  1: "Not at all",
  2: "Some days",
  3: "Most days",
  4: "Every day",
};

/** Filled/empty star strings for compact past-check-in display. */
export const RATING_STARS: Record<HabitRating, string> = {
  1: "★☆☆☆",
  2: "★★☆☆",
  3: "★★★☆",
  4: "★★★★",
};

export const OVERALL_EMOJIS: Record<HabitRating, string> = {
  1: "😔",
  2: "😐",
  3: "😊",
  4: "🤩",
};

export const OVERALL_LABELS: Record<HabitRating, string> = {
  1: "Struggling",
  2: "Okay",
  3: "Good",
  4: "Great",
};

export const RATING_VALUES: HabitRating[] = [1, 2, 3, 4];

/** A 21-day round runs over 3 weekly check-ins. */
export const ROUND_TOTAL_DAYS = 21;
export const ROUND_TOTAL_WEEKS = 3;

/** Active habits in order — these are the ones a user rates each week. */
export function activeHabits(plan: HabitPlan): PlannedHabit[] {
  return [...plan.habits]
    .filter((habit) => habit.isActive)
    .sort((a, b) => a.month - b.month);
}

export function lockedHabits(plan: HabitPlan): PlannedHabit[] {
  return [...plan.habits]
    .filter((habit) => !habit.isActive)
    .sort((a, b) => a.month - b.month);
}

/** The single focus habit of the current 21-day round. */
export function primaryHabit(plan: HabitPlan): PlannedHabit | null {
  return activeHabits(plan)[0] ?? plan.habits[0] ?? null;
}

/** Day counter for the round, clamped to the 21-day window. */
export function roundDay(plan: HabitPlan): number {
  return Math.min(Math.max(plan.daysSinceStart, 0), ROUND_TOTAL_DAYS);
}

/** Strip the parenthetical translation from a section label for compact display. */
export function cleanLabel(label: string): string {
  return label.replace(/\s*\(.*?\)\s*/g, " ").trim();
}

/** Friendly, compact section name from a section key (falls back to the key). */
export function sectionLabel(sectionKey: string): string {
  const full = SECTION_LABELS[sectionKey as SectionKey];
  return full ? cleanLabel(full) : sectionKey;
}

/**
 * Whether a weekly check-in is still owed. Prefers the server flag, otherwise
 * derives it: due when the plan is active and the current week has no check-in.
 */
export function isCheckInDue(plan: HabitPlan | null): boolean {
  if (!plan || plan.status !== "ACTIVE") return false;
  if (typeof plan.hasCheckInDueThisWeek === "boolean") {
    return plan.hasCheckInDueThisWeek;
  }
  return !plan.checkIns?.some((checkIn) => checkIn.weekNumber === plan.currentWeek);
}

/** Clamp an arbitrary rating number to the 1–4 scale (defensive). */
export function toRating(value: number | null | undefined): HabitRating | null {
  if (value == null) return null;
  const rounded = Math.round(value);
  if (rounded < 1) return 1;
  if (rounded > 4) return 4;
  return rounded as HabitRating;
}

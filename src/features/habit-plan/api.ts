import { http, unwrap } from "@/services";
import type {
  CheckInPayload,
  CheckInResult,
  HabitPlan,
  ScoreHistoryEntry,
} from "@/lib/types";

/**
 * The backend envelope (`{ data: ... }`) is unwrapped by `unwrap`, but the inner
 * payload shape can vary between deployments (a bare object vs. a wrapped key).
 * These small normalizers keep the rest of the app working against either shape
 * and never let an unexpected response crash the UI.
 */

function pickObject(raw: unknown, keys: string[]): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === "object") return value as Record<string, unknown>;
  }
  // A bare plan object (has an id) is returned as-is.
  if (typeof record.id === "string") return record;
  return null;
}

function pickArray(raw: unknown, keys: string[]): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as unknown[];
    }
  }
  return [];
}

const PLAN_KEYS = ["habitPlan", "activeHabitPlan", "plan", "activePlan"];

/**
 * Guarantee the 21-day fields exist regardless of backend version: a plain
 * `COMPLETED` plan implies the round is done, and a missing preview list is an
 * empty array. Keeps every consumer free of defensive `?? []` noise.
 */
function withPlanDefaults(plan: HabitPlan | null): HabitPlan | null {
  if (!plan) return null;
  return {
    ...plan,
    shouldReassess: plan.shouldReassess ?? plan.status === "COMPLETED",
    nextWeakSections: Array.isArray(plan.nextWeakSections)
      ? plan.nextWeakSections
      : [],
  };
}

export const habitPlanApi = {
  /** Idempotent — generating an existing plan returns the existing one. */
  generate: async (assessmentId: string): Promise<HabitPlan | null> => {
    const raw = unwrap<unknown>(
      await http.post("/habit-plan/generate", { assessmentId }),
    );
    return withPlanDefaults(pickObject(raw, PLAN_KEYS) as HabitPlan | null);
  },

  getActive: async (signal?: AbortSignal): Promise<HabitPlan | null> => {
    const raw = unwrap<unknown>(await http.get("/habit-plan/active", { signal }));
    return withPlanDefaults(pickObject(raw, PLAN_KEYS) as HabitPlan | null);
  },

  submitCheckIn: async (payload: CheckInPayload): Promise<CheckInResult> => {
    const raw = unwrap<unknown>(await http.post("/habit-plan/check-in", payload));
    const record = (raw && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;
    const message =
      typeof record.encouragementMessage === "string"
        ? record.encouragementMessage
        : null;
    const habitPlan =
      withPlanDefaults(pickObject(raw, PLAN_KEYS) as HabitPlan | null) ??
      undefined;
    const shouldReassess =
      record.shouldReassess === true || habitPlan?.shouldReassess === true;
    return {
      encouragementMessage: message,
      habitPlan,
      shouldReassess,
    };
  },

  getScoreHistory: async (
    signal?: AbortSignal,
  ): Promise<ScoreHistoryEntry[]> => {
    const raw = unwrap<unknown>(
      await http.get("/habit-plan/score-history", { signal }),
    );
    return pickArray(raw, ["scoreHistory", "history", "entries"]) as ScoreHistoryEntry[];
  },
};

import { STORAGE_KEYS } from "@/config/constants";
import type { FamilyProfileInput } from "./types";

/**
 * Local autosave for the family-profile form. We keep the user's last-entered
 * values on their device so a refresh / navigation never loses progress, and so
 * returning users (e.g. starting a fresh assessment) are pre-filled instead of
 * retyping. Scoped by user id so a shared device never leaks one person's
 * details into another's form.
 */
interface StoredDraft {
  userId: string;
  values: FamilyProfileInput;
}

const KEY = STORAGE_KEYS.familyProfileDraft;

/** Returns the saved values for this user, or null if none / unreadable. */
export function loadFamilyProfileDraft(
  userId: string | undefined,
): FamilyProfileInput | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (parsed?.userId !== userId || !parsed.values) return null;
    return parsed.values;
  } catch {
    return null;
  }
}

/** Persists the current form values for this user (best-effort). */
export function saveFamilyProfileDraft(
  userId: string | undefined,
  values: FamilyProfileInput,
): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    const payload: StoredDraft = { userId, values };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* storage full or unavailable — autosave is best-effort, ignore */
  }
}

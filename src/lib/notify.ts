import { toast } from "sonner";
import { normalizeError } from "./error";

/**
 * Centralized toast surface. All user-facing API feedback flows through here so
 * raw backend payloads are never shown — errors are normalized to safe copy.
 */

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyInfo(message: string): void {
  toast.info(message);
}

/**
 * Show a normalized error toast. Silent for:
 *  - canceled/aborted requests (empty message)
 *  - 401s (the HTTP layer already refreshes or redirects to login)
 */
export function notifyError(error: unknown, fallback?: string): void {
  const normalized = normalizeError(error);
  if (!normalized.message) return;
  if (normalized.kind === "unauthorized") return;
  toast.error(fallback ?? normalized.message);
}

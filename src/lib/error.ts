import axios from "axios";
import type { AppError, ApiErrorBody, ErrorKind } from "@/lib/types";

const DEFAULT_MESSAGES: Record<ErrorKind, string> = {
  network: "Unable to connect. Please check your internet connection.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You don't have permission to perform this action.",
  "not-found": "The requested resource could not be found.",
  validation: "Please review the highlighted fields and try again.",
  conflict: "This action conflicts with existing data.",
  "rate-limit": "Too many attempts. Please wait a minute and try again.",
  server: "Something went wrong on our end. Please try again shortly.",
  unknown: "Something went wrong. Please try again.",
};

function kindFromStatus(status: number): ErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "rate-limit";
  if (status >= 500) return "server";
  if (status >= 400) return "unknown";
  return "unknown";
}

/** Pull field-level messages from common validation payload shapes. */
function extractFieldErrors(
  data: Record<string, unknown> | null,
): Record<string, string> | undefined {
  if (!data) return undefined;
  const out: Record<string, string> = {};

  const errors = data.errors ?? data.fieldErrors ?? data.validation;
  if (Array.isArray(errors)) {
    for (const item of errors) {
      if (item && typeof item === "object") {
        const field = (item as Record<string, unknown>).field;
        const message =
          (item as Record<string, unknown>).message ??
          (item as Record<string, unknown>).error;
        if (typeof field === "string" && typeof message === "string") {
          out[field] = message;
        }
      }
    }
  } else if (errors && typeof errors === "object") {
    for (const [field, message] of Object.entries(
      errors as Record<string, unknown>,
    )) {
      if (typeof message === "string") out[field] = message;
      else if (Array.isArray(message) && typeof message[0] === "string") {
        out[field] = message[0];
      }
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Convert any thrown value into a normalized, UI-safe AppError.
 * Server `error` strings are surfaced only for client-actionable statuses
 * (auth/validation/conflict/rate-limit); 5xx and unknown use generic copy.
 */
export function normalizeError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") {
      return { kind: "unknown", status: null, message: "" };
    }

    if (!error.response) {
      return {
        kind: "network",
        status: null,
        message: DEFAULT_MESSAGES.network,
      };
    }

    const status = error.response.status;
    const kind = kindFromStatus(status);
    const body = error.response.data as Partial<ApiErrorBody> | undefined;
    const fieldErrors = extractFieldErrors(
      (body?.data as Record<string, unknown> | null) ?? null,
    );

    const surfaceServerMessage =
      kind === "validation" ||
      kind === "conflict" ||
      kind === "rate-limit" ||
      kind === "not-found" ||
      kind === "unauthorized";

    const serverMessage =
      typeof body?.error === "string" ? body.error : undefined;

    return {
      kind,
      status,
      message:
        (surfaceServerMessage && serverMessage) || DEFAULT_MESSAGES[kind],
      fieldErrors,
    };
  }

  if (error instanceof Error && error.message) {
    return { kind: "unknown", status: null, message: DEFAULT_MESSAGES.unknown };
  }

  return { kind: "unknown", status: null, message: DEFAULT_MESSAGES.unknown };
}

export function getErrorMessage(error: unknown): string {
  return normalizeError(error).message;
}

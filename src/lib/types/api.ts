export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  error: string;
  data: null | Record<string, unknown>;
  timestamp: string;
  path: string;
}

export type ErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "validation"
  | "conflict"
  | "rate-limit"
  | "server"
  | "unknown";

/** Normalized, UI-safe error. Never expose raw backend payloads beyond this. */
export interface AppError {
  kind: ErrorKind;
  status: number | null;
  /** Human-friendly message safe to display to users. */
  message: string;
  /** Field-level validation messages keyed by field name. */
  fieldErrors?: Record<string, string>;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

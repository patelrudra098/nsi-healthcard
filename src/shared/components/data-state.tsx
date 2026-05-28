"use client";

import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/error";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/lib/utils";

/** Inline centered loader for a page/section region. */
export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40dvh] w-full flex-col items-center justify-center gap-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-6" />
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

/** Normalized error panel with optional retry. Never shows raw backend text. */
export function ErrorState({
  error,
  onRetry,
  title = "Something went wrong",
  className,
}: {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const message = error
    ? getErrorMessage(error)
    : "Please try again in a moment.";
  return (
    <div
      className={cn(
        "flex min-h-[40dvh] w-full flex-col items-center justify-center gap-4 px-6 text-center",
        className,
      )}
      role="alert"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--error-soft)] text-[var(--destructive)]">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-heading text-base font-semibold text-[var(--text-primary)]">
          {title}
        </p>
        <p className="max-w-sm text-sm text-[var(--text-muted)]">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}

/** Centered empty placeholder with optional action. */
export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40dvh] w-full flex-col items-center justify-center gap-4 px-6 text-center",
        className,
      )}
    >
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--text-disabled)]">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <div className="max-w-sm space-y-1">
        <p className="font-heading text-base font-semibold text-[var(--text-primary)]">
          {title}
        </p>
        {description && (
          <p className="text-sm text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

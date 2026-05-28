"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Logo } from "@/shared/components/logo";
import { cn } from "@/lib/utils";

interface FlowShellProps {
  children: React.ReactNode;
  /** 0-100 overall progress shown under the header. Omit to hide. */
  progress?: number;
  /** Exit link target (e.g. dashboard). Omit to hide the exit button. */
  exitHref?: string;
  exitLabel?: string;
  /** Content max width. */
  width?: "narrow" | "default" | "wide";
}

const widthClass: Record<NonNullable<FlowShellProps["width"]>, string> = {
  narrow: "max-w-xl",
  default: "max-w-2xl",
  wide: "max-w-3xl",
};

/** Focused, distraction-light frame for the guided assessment journey. */
export function FlowShell({
  children,
  progress,
  exitHref,
  exitLabel = "Exit",
  width = "default",
}: FlowShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          {exitHref && (
            <Link
              href={exitHref}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] outline-none transition-colors hover:bg-[var(--muted)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{exitLabel}</span>
            </Link>
          )}
        </div>
        {typeof progress === "number" && (
          <div
            className="h-1 w-full bg-[var(--muted)]"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Assessment progress"
          >
            <div
              className="h-full bg-[var(--primary)] motion-reduce:transition-none"
              style={{
                width: `${Math.max(0, Math.min(100, progress))}%`,
                transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className={cn("app-page-enter mx-auto w-full", widthClass[width])}>
          {children}
        </div>
      </main>
    </div>
  );
}

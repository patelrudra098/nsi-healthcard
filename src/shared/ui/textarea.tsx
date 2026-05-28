"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   VARIANTS
   ════════════════════════════════════════════════════════ */

const textareaVariants = cva(
  [
    // Layout
    "flex w-full min-w-0",
    "field-sizing-content",
    "min-h-20",

    // Border & background
    "border bg-[var(--card)]",
    "border-[var(--input)]",
    "shadow-[var(--shadow-sm)]",

    // Typography
    "text-sm text-[var(--foreground)]",
    "placeholder:text-[var(--muted-foreground)]",

    // Resize
    "resize-y",

    // GROUP 6: FORM FOCUS (150ms)
    "transition-[border-color,box-shadow] duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    "outline-none",

    // Hover — only on non-error, non-success (scoped via state variant)
    "hover:border-[color-mix(in_srgb,var(--ring)_40%,transparent)]",

    // Focus — default primary
    "focus-visible:border-[var(--ring)]",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--focus-ring)]",
    "focus-visible:ring-offset-2",
    "ring-offset-[var(--background)]",

    // Disabled
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "disabled:bg-[var(--muted)]",
    "disabled:hover:border-[var(--input)]", // ← prevent hover on disabled

    // Accessibility
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "px-3 py-2 text-xs rounded-[var(--radius-sm)]",
        default: "px-4 py-2.5 text-sm rounded-[var(--radius)]",
        lg: "px-5 py-3 text-base rounded-[var(--radius-md)]",
      },

      state: {
        // ── Default: primary focus ring ──────────────────
        default: "",

        // ── Error: red border always visible ─────────────
        error: [
          // Border always red — even without focus
          "border-[var(--destructive)]",
          // Hover: keep red, no blue bleed
          "hover:border-[var(--destructive)]",
          // Focus: red border + red ring
          "focus-visible:border-[var(--destructive)]",
          "focus-visible:ring-[color-mix(in_srgb,var(--destructive)_25%,transparent)]",
        ].join(" "),

        // ── Success: green border always visible ──────────
        success: [
          // Border always green
          "border-[var(--success)]",
          // Hover: keep green, no blue bleed
          "hover:border-[var(--success)]",
          // Focus: green border + green ring
          "focus-visible:border-[var(--success)]",
          "focus-visible:ring-[color-mix(in_srgb,var(--success)_25%,transparent)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  },
);

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  helper?: string;
  error?: string;
  success?: string;
  size?: VariantProps<typeof textareaVariants>["size"];
  state?: VariantProps<typeof textareaVariants>["state"];
  wrapperClassName?: string;
}

/* ════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════ */

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helper,
      error,
      success,
      size = "default",
      state,
      wrapperClassName,
      id,
      ...props
    },
    ref,
  ) => {
    // ✅ useId always at top level — never conditional
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    // Priority: error > success > explicit state > default
    const resolvedState: VariantProps<typeof textareaVariants>["state"] =
      error ? "error" : success ? "success" : (state ?? "default");

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", wrapperClassName)}>

        {/* ── Label ──────────────────────────────────────── */}
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--foreground)] select-none"
          >
            {label}
          </label>
        )}

        {/* ── Textarea ───────────────────────────────────── */}
        <textarea
          id={textareaId}
          ref={ref}
          data-slot="textarea"
          // ✅ aria-invalid drives screen reader error announcement
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error ? errorId : helper ? helperId : undefined
          }
          className={cn(
            textareaVariants({ size, state: resolvedState }),
            className,
          )}
          {...props}
        />

        {/* ── Helper ─────────────────────────────────────── */}
        {helper && !error && !success && (
          <p
            id={helperId}
            className="text-xs text-[var(--muted-foreground)] ml-0.5"
          >
            {helper}
          </p>
        )}

        {/* ── Error message ──────────────────────────────── */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-[var(--destructive)] ml-0.5"
          >
            {error}
          </p>
        )}

        {/* ── Success message ────────────────────────────── */}
        {success && !error && (
          <p className="text-xs font-medium text-[var(--success)] ml-0.5">
            {success}
          </p>
        )}

      </div>
    );
  },
);

Textarea.displayName = "Textarea";

/* ════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════ */

export { Textarea, textareaVariants };
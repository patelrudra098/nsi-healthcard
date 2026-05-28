"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/* ─── Size-aware prefix/suffix spacing ─────────────── */

const prefixPos = {
  sm: "left-3",
  default: "left-3.5 md:left-3",
  lg: "left-4",
} as const;

const suffixPos = {
  sm: "right-3",
  default: "right-3.5 md:right-3",
  lg: "right-4",
} as const;

const plPrefix = {
  sm: "pl-9",
  default: "pl-10 md:pl-9",
  lg: "pl-11",
} as const;

const prSuffix = {
  sm: "pr-9",
  default: "pr-10 md:pr-9",
  lg: "pr-11",
} as const;

/* ─── Variants (Group A — Control Height) ──────────── */

const inputVariants = cva(
  [
    /* Layout */
    "flex w-full min-w-0 appearance-none",

    /* Visual */
    "border bg-[var(--card)] text-[var(--foreground)]",
    "shadow-[var(--shadow-sm)] border-[var(--input)]",
    "outline-none",

    /* Placeholder */
    "placeholder:text-[var(--muted-foreground)]",

    /* GROUP 6: FORM FOCUS — 150ms border + ring */
    "transition-[border-color,box-shadow] duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",

    /* Hover */
    "hover:border-[color-mix(in_srgb,var(--ring)_40%,transparent)]",

    /* Focus */
    "focus-visible:border-[var(--ring)]",
    "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
    "focus-visible:ring-offset-2 ring-offset-[var(--background)]",

    /* Disabled */
    "disabled:pointer-events-none disabled:cursor-not-allowed",
    "disabled:opacity-50 disabled:bg-[var(--muted)]",

    /* Accessibility */
    "motion-reduce:transition-none",

    /* Autofill */
    "[&:-webkit-autofill]:shadow-[0_0_0px_1000px_var(--card)_inset]",
    "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]",
  ],
  {
    variants: {
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
        default: "h-11 md:h-10 px-5 md:px-4 text-sm rounded-[var(--radius)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
      },
      state: {
        default: "",
        error: [
          "border-[var(--destructive)]",
          "focus-visible:border-[var(--destructive)]",
          "focus-visible:ring-[color-mix(in_srgb,var(--destructive)_20%,transparent)]",
        ],
        success: [
          "border-[var(--success)]",
          "focus-visible:border-[var(--success)]",
          "focus-visible:ring-[color-mix(in_srgb,var(--success)_20%,transparent)]",
        ],
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  },
);

/* ─── Props ────────────────────────────────────────── */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  helper?: string;
  error?: string;
  success?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clearable?: boolean;
  size?: VariantProps<typeof inputVariants>["size"];
  state?: VariantProps<typeof inputVariants>["state"];
  wrapperClassName?: string;
}

/* ─── Component ────────────────────────────────────── */

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helper,
      error,
      success,
      prefix,
      suffix,
      clearable,
      size = "default",
      state,
      wrapperClassName,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    /* Controlled / uncontrolled */
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(
      defaultValue ?? "",
    );
    const currentValue = isControlled ? value : internalValue;
    const hasValue = Boolean(currentValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const clearValue = () => {
      if (!isControlled) setInternalValue("");
      onChange?.({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    /* Derived */
    const resolvedState = error ? "error" : success ? "success" : state;
    const hasSuffix = Boolean(suffix) || (clearable && hasValue);
    const sk = (size ?? "default") as "sm" | "default" | "lg";

    // Get prefix color based on state
    const getPrefixColorClass = () => {
      if (resolvedState === "error") return "text-[var(--destructive)]";
      if (resolvedState === "success") return "text-[var(--success)]";
      return "text-[var(--muted-foreground)] group-focus-within/field:text-[var(--ring)]";
    };

    return (
      <div className={cn("flex w-full flex-col gap-1.5", wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--foreground)] select-none"
          >
            {label}
          </label>
        )}

        {/* Field — group/field enables focus-within for adornments */}
        <div className="group/field relative flex items-center">
          {/* Prefix adornment */}
          {prefix && (
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 flex items-center",
                getPrefixColorClass(),
                "transition-colors duration-150",
                "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
                "motion-reduce:transition-none",
                prefixPos[sk],
              )}
            >
              {prefix}
            </div>
          )}

          {/* Input element */}
          <input
            id={inputId}
            ref={ref}
            value={currentValue}
            onChange={handleChange}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helper ? helperId : undefined
            }
            className={cn(
              inputVariants({ size, state: resolvedState }),
              prefix && plPrefix[sk],
              hasSuffix && prSuffix[sk],
              // Cursor styling - always primary text color
              "[caret-color:var(--text-primary)]",
              className,
            )}
            {...props}
          />

          {/* Suffix area */}
          {hasSuffix && (
            <div
              className={cn(
                "absolute inset-y-0 flex items-center gap-1.5",
                suffixPos[sk],
              )}
            >
              {clearable && hasValue && (
                <button
                  type="button"
                  onClick={clearValue}
                  tabIndex={-1}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    "text-[var(--muted-foreground)]",
                    "hover:text-[var(--foreground)] hover:bg-[var(--muted)]",
                    /* GROUP 4: STATE TRANSITION — 150ms */
                    "transition-colors duration-150",
                    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
                    "motion-reduce:transition-none",
                  )}
                  aria-label="Clear input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {suffix && (
                <div className="flex items-center text-[var(--muted-foreground)]">
                  {suffix}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message (takes priority) */}
        {error && (
          <p
            id={errorId}
            className="text-xs font-medium text-[var(--destructive)]"
          >
            {error}
          </p>
        )}

        {/* Success message */}
        {success && !error && (
          <p className="text-xs font-medium text-[var(--success)]">
            {success}
          </p>
        )}

        {/* Helper text */}
        {helper && !error && !success && (
          <p
            id={helperId}
            className="text-xs text-[var(--muted-foreground)]"
          >
            {helper}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Minus } from "lucide-react";

/* ─── Size context (internal) ──────────────────────── */

type OTPSize = "sm" | "default" | "lg";

const OTPSizeCtx = React.createContext<OTPSize>("default");

/* ─── Slot variants (Group A — Control Height) ─────── */

const slotVariants = cva(
  [
    "relative flex items-center justify-center",
    "font-semibold select-none",
    "bg-[var(--card)] text-[var(--foreground)]",
    "border border-[var(--input)]",
    "shadow-[var(--shadow-sm)]",

    /* GROUP 6: FORM FOCUS — 150ms border + ring */
    "transition-[border-color,box-shadow] duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      size: {
        sm:      "h-9  w-9  text-base rounded-[var(--radius-sm)]",
        default: "h-11 w-11 md:h-10 md:w-10 text-lg rounded-[var(--radius)]",
        lg:      "h-12 w-12 text-xl rounded-[var(--radius-md)]",
      },
      isActive: {
        true: [
          "border-[var(--ring)]",
          "ring-2 ring-[var(--focus-ring)]",
          "ring-offset-2 ring-offset-[var(--background)]",
          "z-10",
        ],
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      isActive: false,
    },
  },
);

/* ─── Caret height per size ────────────────────────── */

const caretH: Record<OTPSize, string> = {
  sm:      "h-4",
  default: "h-5",
  lg:      "h-6",
};

/* ─── InputOTP ─────────────────────────────────────── */

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  Omit<React.ComponentPropsWithoutRef<typeof OTPInput>, "size"> & {
    containerClassName?: string;
    size?: OTPSize;
  }
>(
  (
    {
      className,
      containerClassName,
      autoFocus = true,
      size = "default",
      ...props
    },
    ref,
  ) => (
    <OTPSizeCtx.Provider value={size}>
      <OTPInput
        ref={ref}
        autoFocus={autoFocus}
        containerClassName={cn(
          "flex items-center gap-2 has-disabled:opacity-50",
          containerClassName,
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...(props as React.ComponentPropsWithoutRef<typeof OTPInput>)}
      />
    </OTPSizeCtx.Provider>
  ),
);
InputOTP.displayName = "InputOTP";

/* ─── InputOTPGroup ────────────────────────────────── */

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 sm:gap-2.5", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

/* ─── InputOTPSlot ─────────────────────────────────── */

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index: number }
>(({ index, className, ...props }, ref) => {
  const ctx = React.useContext(OTPInputContext);
  const size = React.useContext(OTPSizeCtx);

  if (!ctx) {
    if (process.env.NODE_ENV === "development") {
      console.warn("InputOTPSlot must be used within InputOTP");
    }
    return null;
  }

  const { slots = [] } = ctx;
  const slot = slots[index] ?? {};
  const { char = "", hasFakeCaret = false, isActive = false } = slot;

  return (
    <div
      ref={ref}
      className={cn(slotVariants({ size, isActive }), className)}
      {...props}
    >
      {char}

      {/* Caret — Blink animation with Tailwind only */}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "w-0.5 rounded-full bg-[var(--foreground)]",
              caretH[size],
              "opacity-0 [animation:pulse_1.2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
              "motion-reduce:animate-none",
            )}
          />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

/* ─── InputOTPSeparator ────────────────────────────── */

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus className="h-4 w-4 text-[var(--muted-foreground)]" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
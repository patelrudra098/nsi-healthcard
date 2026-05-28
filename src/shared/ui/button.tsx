"use client";    ///100% DONE

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-semibold",
    "select-none cursor-pointer",

    // Accessibility
    "disabled:pointer-events-none disabled:cursor-not-allowed",

    // Focus — outline-based (Tailwind v4 compatible)
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-[var(--focus-ring)]",

    // Motion — GROUP 1: TACTILE PRESS (FIXED)
    "transition-[background-color,color,border-color,box-shadow,transform]",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    "motion-reduce:transition-none",

    // Tactile press
    "active:scale-[0.985]",
    "motion-reduce:active:scale-100",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--primary)]",
          "text-[var(--primary-foreground)]",
          "shadow-[var(--shadow-sm)]",

          "hover:bg-[var(--primary-hover)]",
          "hover:shadow-[var(--shadow-md)]",

          "active:bg-[var(--primary-active)]",
          "active:shadow-[var(--shadow-sm)]",

          "disabled:bg-[var(--muted)]",
          "disabled:text-[var(--text-disabled)]",
          "disabled:shadow-none",
        ].join(" "),

        secondary: [
          "bg-[var(--secondary)]",
          "text-[var(--secondary-foreground)]",
          "shadow-[var(--shadow-sm)]",

          "hover:bg-[var(--secondary-hover)]",
          "hover:shadow-[var(--shadow-md)]",

          "active:bg-[var(--secondary-active)]",
          "active:shadow-[var(--shadow-sm)]",

          "disabled:bg-[var(--muted)]",
          "disabled:text-[var(--text-disabled)]",
          "disabled:shadow-none",
        ].join(" "),

        destructive: [
          "bg-[var(--destructive)]",
          "text-[var(--destructive-foreground)]",
          "shadow-[var(--shadow-sm)]",

          "hover:bg-[var(--destructive-hover)]",
          "hover:shadow-[var(--shadow-md)]",

          "active:bg-[var(--destructive-active)]",
          "active:shadow-[var(--shadow-sm)]",

          "disabled:bg-[var(--muted)]",
          "disabled:text-[var(--text-disabled)]",
          "disabled:shadow-none",
        ].join(" "),

        outline: [
          "border border-[var(--border)]",
          "bg-transparent",
          "text-[var(--foreground)]",
          "shadow-[var(--shadow-sm)]",

          "hover:bg-[var(--accent)]",
          "hover:text-[var(--accent-foreground)]",
          "hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)]",
          "hover:shadow-[var(--shadow-md)]",

          "active:shadow-none",

          "disabled:bg-[var(--muted)]",
          "disabled:text-[var(--text-disabled)]",
          "disabled:border-[var(--border)]",
          "disabled:shadow-none",
        ].join(" "),

        ghost: [
          "bg-transparent",
          "text-[var(--foreground)]",

          "hover:bg-[color-mix(in_srgb,var(--muted)_50%,transparent)]",
          "hover:text-[var(--text-primary)]",

          "active:bg-[var(--muted)]",

          "disabled:text-[var(--text-disabled)]",
        ].join(" "),

        link: [
          "bg-transparent",
          "text-[var(--primary)]",
          "underline-offset-4 hover:underline",
          "hover:text-[var(--primary-hover)]",
          "p-0 h-auto",

          "disabled:text-[var(--text-disabled)]",
          "disabled:no-underline",
        ].join(" "),
      },

      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
        default: "h-11 md:h-10 px-5 md:px-4 text-sm rounded-[var(--radius)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
        icon: "h-10 w-10 shrink-0 rounded-[var(--radius)]",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          buttonVariants({ variant, size }),
          isLoading && "cursor-wait",
          className,
        )}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        aria-disabled={isDisabled || undefined}
        data-loading={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <Loader2
            className="absolute h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            "inline-flex items-center gap-2",
            isLoading && "opacity-0",
          )}
        >
          {children}
        </span>
        {isLoading && <span className="sr-only">Loading</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
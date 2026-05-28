"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   VARIANTS
   ════════════════════════════════════════════════════════ */

const cardVariants = cva(
  [
    // Layout
    "relative flex flex-col",

    // Clip content within rounded corners
    "overflow-hidden",

    // Shape + surface using design tokens
    "rounded-[var(--radius)] border",
    "bg-[var(--card)] border-[var(--border)]",

    // Focus system matching your tokens
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[var(--focus-ring)] ring-offset-[var(--background)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "shadow-[var(--shadow-sm)]",
        elevated: "shadow-[var(--shadow-md)]",
        outline: "shadow-none",
        soft: "bg-[var(--accent)] border-transparent shadow-none",
        destructive: [
          "bg-[var(--error-soft)]",
          "border-[color-mix(in_srgb,var(--error)_20%,transparent)]",
          "shadow-none",
        ].join(" "),
      },

      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },

      interactive: {
        // GROUP 1: TACTILE PRESS - Perfect implementation
        true: [
          "cursor-pointer select-none",

          // Motion system - EXACTLY as specified in animation guide
          "transition-[background-color,box-shadow,transform]",
          "duration-150",
          "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          "active:scale-[0.985]",
          "motion-reduce:transition-none motion-reduce:active:scale-100",
        ].join(" "),
        false: "",
      },

      fullWidth: {
        true: "w-full",
        false: "",
      },
    },

    // Hover effects ONLY on interactive cards
    compoundVariants: [
      {
        interactive: true,
        variant: "default",
        className: "hover:shadow-[var(--shadow-md)]",
      },
      {
        interactive: true,
        variant: "elevated",
        className: "hover:shadow-[var(--shadow-lg)]",
      },
      {
        interactive: true,
        variant: "outline",
        className: [
          "hover:shadow-[var(--shadow-sm)]",
          "hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)]",
        ].join(" "),
      },
      {
        interactive: true,
        variant: "soft",
        className: "hover:shadow-[var(--shadow-sm)]",
      },
      {
        interactive: true,
        variant: "destructive",
        className: [
          "hover:shadow-[var(--shadow-sm)]",
          "hover:border-[color-mix(in_srgb,var(--error)_30%,transparent)]",
        ].join(" "),
      },
    ],

    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: false,
      fullWidth: false,
    },
  },
);

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/* ════════════════════════════════════════════════════════
   CARD ROOT
   ════════════════════════════════════════════════════════ */

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      interactive,
      fullWidth,
      onKeyDown,
      onClick,
      ...props
    },
    ref,
  ) => {
    // Keyboard handler for interactive cards
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          e.currentTarget.click();
        }
        onKeyDown?.(e);
      },
      [interactive, onKeyDown],
    );

    return (
      <div
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? handleKeyDown : onKeyDown}
        onClick={onClick}
        className={cn(
          cardVariants({ variant, padding, interactive, fullWidth }),
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

/* ════════════════════════════════════════════════════════
   SUBCOMPONENTS
   ════════════════════════════════════════════════════════ */

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-[var(--card-foreground)]",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--muted-foreground)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-2 p-4 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

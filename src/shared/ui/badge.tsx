import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* ─── Variant definitions ───────────────────────────── */

const badgeVariants = cva(
  [
    /* Layout */
    "inline-flex items-center justify-center",
    "shrink-0 w-fit",

    /* Typography */
    "font-medium leading-none select-none whitespace-nowrap",

    /* Shape — full pill eliminates "chipped" corners */
    "rounded-full",

    /* Accessible focus */
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-[var(--focus-ring)]",
  ],
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)]   text-[var(--text-inverse)]",
        secondary: "bg-[var(--secondary)] text-[var(--text-inverse)]",
        success: "bg-[var(--success)]   text-[var(--text-inverse)]",
        warning: "bg-[var(--warning)]   text-[var(--text-inverse)]",
        error: "bg-[var(--error)]     text-[var(--text-inverse)]",
        info: "bg-[var(--info)]      text-[var(--text-inverse)]",
        outline: [
          "border border-[var(--border)]",
          "bg-transparent text-[var(--text-secondary)]",
        ],
        soft: "bg-[var(--muted)] text-[var(--text-secondary)]",
      },
      size: {
        sm: "h-5 px-2   gap-1   text-[11px]",   // 20px
        default: "h-6 px-2.5 gap-1.5 text-xs",        // 24px
        lg: "h-7 px-3   gap-1.5 text-sm",        // 28px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/* ─── Interactive hover / active map ────────────────── */

const interactiveHoverMap: Record<string, string> = {
  default: "hover:bg-[var(--primary-hover)]   active:bg-[var(--primary-active)]",
  secondary: "hover:bg-[var(--secondary-hover)] active:bg-[var(--secondary-active)]",
  success: "hover:bg-[var(--success-hover)]   active:bg-[var(--success-active)]",
  warning: "hover:bg-[var(--warning-hover)]   active:bg-[var(--warning-active)]",
  error: "hover:bg-[var(--error-hover)]     active:bg-[var(--error-active)]",
  info: "hover:bg-[var(--info-hover)]      active:bg-[var(--info-active)]",
  outline: "hover:bg-[var(--muted)]",
  soft: "hover:bg-[var(--border)]",
}

/* ─── Component ─────────────────────────────────────── */

export interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof badgeVariants> {
  /** Enables hover, active & tactile-press feedback (Animation Group 1) */
  interactive?: boolean
  /** Merges props onto child element via Radix Slot */
  asChild?: boolean
}

function Badge({
  className,
  variant = "default",
  size,
  interactive = false,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp: React.ElementType = asChild
    ? Slot
    : interactive
      ? "button"
      : "span"

  return (
    <Comp
      className={cn(
        badgeVariants({ variant, size }),

        interactive
          ? [
            /* ── Group 1 — Tactile Press ── */
            "cursor-pointer",
            "transition-[background-color,box-shadow,transform]",
            "duration-150",
            "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
            "active:scale-[0.985]",
            "motion-reduce:transition-none",
            "motion-reduce:active:scale-100",
            interactiveHoverMap[variant ?? "default"],
          ]
          : [
            /* ── Group 4 — State Transition (passive) ── */
            "transition-colors duration-150",
            "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
            "motion-reduce:transition-none",
          ],

        className
      )}
      {...(interactive && !asChild ? { type: "button" as const } : {})}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
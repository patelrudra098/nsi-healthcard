"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  /**
   * Variant of the progress bar
   * @default "default"
   */
  variant?: "default" | "success" | "warning" | "error"
  /**
   * Size of the progress bar
   * @default "default"
   */
  size?: "sm" | "default" | "lg"
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", size = "default", ...props }, ref) => {
  // Variant styles using design tokens
  const variantStyles = {
    default: {
      track: "bg-[var(--muted)]",
      fill: "bg-[var(--primary)]",
    },
    success: {
      track: "bg-[var(--success-soft)]",
      fill: "bg-[var(--success)]",
    },
    warning: {
      track: "bg-[var(--warning-soft)]",
      fill: "bg-[var(--warning)]",
    },
    error: {
      track: "bg-[var(--error-soft)]",
      fill: "bg-[var(--error)]",
    },
  }

  // Size styles
  const sizeStyles = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3",
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        // Base styles
        "relative w-full overflow-hidden",
        "rounded-full",
        
        // Size
        sizeStyles[size],
        
        // Variant track color
        variantStyles[variant].track,
        
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          // Base indicator styles
          "h-full w-full flex-1",
          "rounded-full",
          
          // GROUP 4: STATE TRANSITION - Width/transform animation
          // Timing: 150ms (bar progression)
          // Curve: cubic-bezier(0, 0, 0.2, 1)
          // Property: transform (smooth width changes)
          "transition-transform duration-150",
          "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          
          // Accessibility
          "motion-reduce:transition-none",
          
          // Variant fill color
          variantStyles[variant].fill
        )}
        style={{ 
          transform: `translateX(-${100 - (value ?? 0)}%)` 
        }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
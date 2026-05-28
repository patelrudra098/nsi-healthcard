"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        // Base styles with design tokens
        "shrink-0",
        "bg-[var(--border)]",
        
        // Orientation-specific dimensions
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        
        // GROUP 4: STATE TRANSITION - Color/opacity changes
        // Timing: 150ms (micro interactions)
        // Curve: cubic-bezier(0, 0, 0.2, 1) - standard easing
        "transition-colors duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        
        // Accessibility first
        "motion-reduce:transition-none",
        
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
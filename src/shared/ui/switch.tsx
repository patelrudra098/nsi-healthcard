"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    // Layout
    "peer inline-flex shrink-0 cursor-pointer items-center",
    "rounded-full border-2 border-transparent",
    
    // Design tokens
    "shadow-[var(--shadow-sm)]",
    
    // GROUP 1: TACTILE PRESS (150ms)
    // Background + shadow + transform for switch press
    "transition-[background-color,box-shadow,transform]",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Press feedback
    "active:scale-[0.985]",
    
    // Unchecked state
    "bg-[var(--input)]",
    
    // Checked state
    "data-[state=checked]:bg-[var(--primary)]",
    
    // Focus styles
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--focus-ring)]",
    "focus-visible:ring-offset-2",
    
    // Disabled state
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "disabled:shadow-none",
    
    // Accessibility
    "motion-reduce:transition-none",
    "motion-reduce:active:scale-100",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-4 w-7", // 16px height, 28px width
        default: "h-5 w-9", // 20px height, 36px width
        lg: "h-6 w-11", // 24px height, 44px width
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const switchThumbVariants = cva(
  [
    // Layout
    "pointer-events-none block rounded-full",
    "bg-[var(--background)]",
    "shadow-[var(--shadow-sm)]",
    
    // GROUP 4: STATE TRANSITION (150ms)
    // Transform for thumb movement
    "transition-transform duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Unchecked position
    "translate-x-0",
    
    // Accessibility
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-3 w-3", // 12px thumb for 16px switch
        default: "h-4 w-4", // 16px thumb for 20px switch  
        lg: "h-5 w-5", // 20px thumb for 24px switch
      },
    },
    compoundVariants: [
      // Industry standard: Checked positions reach the end perfectly
      { size: "sm", className: "data-[state=checked]:translate-x-3" },
      { size: "default", className: "data-[state=checked]:translate-x-4" },
      { size: "lg", className: "data-[state=checked]:translate-x-5" },
    ],
    defaultVariants: {
      size: "default",
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(switchVariants({ size }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb className={switchThumbVariants({ size })} />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch, switchVariants };
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  [
    // Base styles with design tokens
    "text-sm font-medium leading-none",
    "text-[var(--foreground)]",
    "select-none",
    
    // GROUP 6: FORM FOCUS - Color transitions (150ms)
    "transition-colors duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Disabled states
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
    
    // Accessibility
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        default: "",
        required: "after:content-['*'] after:ml-1 after:text-[var(--destructive)]",
      },
      
      state: {
        default: "",
        error: "text-[var(--destructive)]",
        success: "text-[var(--success)]",
        disabled: "text-[var(--text-disabled)]",
      },
      
      size: {
        sm: "text-xs",
        default: "text-sm", 
        lg: "text-base",
      },
    },
    
    defaultVariants: {
      variant: "default",
      state: "default", 
      size: "default",
    },
  },
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, state, size, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, state, size }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }
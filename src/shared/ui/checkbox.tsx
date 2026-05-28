"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  [
    // Layout
    "peer shrink-0",
    
    // Design tokens
    "border border-[var(--border)]",
    "bg-[var(--card)]",
    "shadow-[var(--shadow-sm)]",
    
    // GROUP 1: TACTILE PRESS (150ms)
    "transition-[background-color,border-color,box-shadow,transform]",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Press feedback
    "active:scale-[0.985]",
    
    // Checked state
    "data-[state=checked]:bg-[var(--primary)]",
    "data-[state=checked]:border-[var(--primary)]",
    "data-[state=checked]:text-[var(--primary-foreground)]",
    
    // Indeterminate state  
    "data-[state=indeterminate]:bg-[var(--primary)]",
    "data-[state=indeterminate]:border-[var(--primary)]",
    "data-[state=indeterminate]:text-[var(--primary-foreground)]",
    
    // Focus styles
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--focus-ring)]",
    "focus-visible:ring-offset-2",
    
    // Error state
    "aria-invalid:border-[var(--destructive)]",
    "aria-invalid:ring-1",
    "aria-invalid:ring-[var(--destructive)]/20",
    
    // Cursor
    "cursor-pointer",
    
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
        sm: "size-3.5 rounded-[3px]", // 14px - compact forms
        default: "size-4 rounded-[4px]", // 16px - standard
        lg: "size-5 rounded-[5px]", // 20px - accessibility/large text
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const checkboxIconVariants = cva(
  [
    // Layout
    "flex items-center justify-center text-current",
    
    // GROUP 4: STATE TRANSITION (150ms)
    "transition-[opacity,transform] duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Hidden by default
    "opacity-0 scale-75",
    
    // Visible when checked/indeterminate
    "data-[state=checked]:opacity-100 data-[state=checked]:scale-100",
    "data-[state=indeterminate]:opacity-100 data-[state=indeterminate]:scale-100",
    
    // Accessibility
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-2.5 w-2.5", // 10px icon for 14px checkbox
        default: "h-3.5 w-3.5", // 14px icon for 16px checkbox  
        lg: "h-4 w-4", // 16px icon for 20px checkbox
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={checkboxIconVariants({ size })}>
      {/* Check icon for checked state */}
      <CheckIcon 
        className="block data-[state=indeterminate]:hidden" 
        strokeWidth={2.5} 
      />
      {/* Minus icon for indeterminate state */}
      <MinusIcon 
        className="hidden data-[state=indeterminate]:block" 
        strokeWidth={2.5} 
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };
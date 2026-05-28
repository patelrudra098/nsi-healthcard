"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("grid gap-3", className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const radioGroupItemVariants = cva(
  [
    // Layout - centered flex container
    "peer shrink-0 rounded-full aspect-square",
    "flex items-center justify-center",
    
    // Design tokens
    "border border-[var(--border)]",
    "bg-[var(--card)]",
    "shadow-[var(--shadow-sm)]",
    
    // GROUP 1: TACTILE PRESS (150ms)
    // Background + border + shadow + transform for radio press
    "transition-[background-color,border-color,box-shadow,transform]",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Press feedback
    "active:scale-[0.985]",
    
    // Selected state
    "data-[state=checked]:bg-[var(--primary)]",
    "data-[state=checked]:border-[var(--primary)]",
    "data-[state=checked]:text-[var(--primary-foreground)]",
    
    // Focus styles
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--focus-ring)]",
    "focus-visible:ring-offset-2",
    
    // Error state
    "aria-invalid:border-[var(--destructive)]",
    "aria-invalid:ring-1",
    "aria-invalid:ring-[var(--destructive)]/20",
    
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
        sm: "size-3.5", // 14px - compact forms
        default: "size-4", // 16px - standard
        lg: "size-5", // 20px - accessibility/large text
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const radioGroupIndicatorVariants = cva(
  [
    // Layout - solid filled circle, centered by parent
    "rounded-full bg-current",
    
    // GROUP 4: STATE TRANSITION (150ms)
    // Scale transition for smooth appearance
    "transition-[opacity,transform] duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    
    // Hidden by default
    "opacity-0 scale-0",
    
    // Visible when checked - solid filled dot
    "data-[state=checked]:opacity-100 data-[state=checked]:scale-100",
    
    // Accessibility
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-1.5 w-1.5", // 6px dot for 14px radio
        default: "h-2 w-2", // 8px dot for 16px radio  
        lg: "h-2.5 w-2.5", // 10px dot for 20px radio
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(radioGroupItemVariants({ size }), className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className={radioGroupIndicatorVariants({ size })} />
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
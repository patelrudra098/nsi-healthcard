"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";

const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    className={cn("group/collapsible", className)}
    {...props}
  />
));
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn(
      // Layout
      "flex items-center justify-between gap-4",
      "w-full px-4 py-3",

      // Typography
      "text-left text-sm font-medium",
      "text-[var(--foreground)]",

      // Cursor
      "cursor-pointer select-none",

      // GROUP 4: STATE TRANSITION - Color only (150ms)
      "transition-colors duration-150",
      "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",

      // Hover state
      "hover:text-[var(--primary)]",
      "hover:bg-[var(--muted)]",

      // Focus styles using design tokens
      "outline-none rounded-[var(--radius)]",
      "focus-visible:ring-2 focus-visible:ring-inset",
      "focus-visible:ring-[var(--focus-ring)]",

      // Disabled state
      "disabled:pointer-events-none disabled:opacity-50",

      // Open state
      "data-[state=open]:text-[var(--primary)]",

      // Accessibility
      "motion-reduce:transition-none",

      className
    )}
    {...props}
  />
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      // Base
      "overflow-hidden",
      "text-sm text-[var(--muted-foreground)]",

      // GROUP 3: CONTENT REVEAL
      // Uses keyframes from global CSS (ONLY collapsible uses keyframes)
      // Timing: 200ms both ways | Curve: ease-out
      "data-[state=open]:animate-collapsible-down",
      "data-[state=closed]:animate-collapsible-up",

      // Accessibility
      "motion-reduce:animate-none",

      className
    )}
    {...props}
  >
    <div className="px-4 pb-3 pt-0">
      {children}
    </div>
  </CollapsiblePrimitive.CollapsibleContent>
));
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
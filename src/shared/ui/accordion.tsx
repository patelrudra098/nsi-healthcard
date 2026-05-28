"use client";         /// 100% Done

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      // Named group for scoped selectors
      "group/item",

      // Layout
      "overflow-hidden",

      // Design tokens
      "rounded-[var(--radius)]",
      "border border-[var(--border)]",
      "bg-[var(--card)]",

      // GROUP 4: STATE TRANSITION - Border + shadow (150ms)
      // Only animate what changes - border and shadow
      "transition-[border-color,box-shadow] duration-150",
      "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",

      // Hover state
      "hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]",
      "hover:shadow-[var(--shadow-sm)]",

      // Open state
      "data-[state=open]:border-[color-mix(in_srgb,var(--primary)_40%,transparent)]",
      "data-[state=open]:shadow-[var(--shadow-md)]",

      // Accessibility
      "motion-reduce:transition-none",

      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        // Layout
        "flex flex-1 items-center justify-between gap-4",
        "px-5 py-4",

        // Typography
        "text-left text-sm font-semibold",
        "text-[var(--foreground)]",

        // Cursor
        "cursor-pointer select-none",

        // GROUP 4: STATE TRANSITION - Color only (150ms)
        "transition-colors duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",

        // Hover - text color
        "hover:text-[var(--primary)]",

        // Focus styles using design tokens
        "outline-none rounded-[var(--radius)]",
        "focus-visible:ring-2 focus-visible:ring-inset",
        "focus-visible:ring-[var(--focus-ring)]",

        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",

        // Accessibility
        "motion-reduce:transition-none",

        className
      )}
      {...props}
    >
      {children}

      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0",
          "text-[var(--muted-foreground)]",

          // GROUP 4: STATE TRANSITION - Transform + color (150ms)
          "transition-[transform,color] duration-150",
          "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",

          // Hover state via parent group
          "group-hover/item:text-[var(--primary)]",

          // Open state - rotate chevron
          "group-data-[state=open]/item:rotate-180",
          "group-data-[state=open]/item:text-[var(--primary)]",

          // Accessibility
          "motion-reduce:transition-none"
        )}
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      // Base
      "overflow-hidden",
      "text-sm text-[var(--muted-foreground)]",

      // GROUP 3: CONTENT REVEAL
      // Uses keyframes from global CSS (ONLY accordion uses keyframes)
      // Timing: 200ms both ways | Curve: ease-out
      "data-[state=open]:animate-accordion-down",
      "data-[state=closed]:animate-accordion-up",

      // Accessibility
      "motion-reduce:animate-none",

      className
    )}
    {...props}
  >
    <div className="px-5 pb-5 pt-0">
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
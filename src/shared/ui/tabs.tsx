"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   CONTEXT — propagates variant + size from List → Triggers
   ════════════════════════════════════════════════════════ */

type TabsVariant = "default" | "line" | "pills";
type TabsSize = "sm" | "default" | "lg";

type TabsVariantContextValue = {
  variant: TabsVariant;
  size: TabsSize;
};

const TabsVariantContext = React.createContext<TabsVariantContextValue>({
  variant: "default",
  size: "default",
});

/* ════════════════════════════════════════════════════════
   VARIANTS
   ════════════════════════════════════════════════════════ */

const tabsListVariants = cva(
  [
    "inline-flex items-center",

    // ── Responsive scroll ──────────────────────────
    // max-w-full caps at parent width;
    // overflow-x-auto enables scroll when triggers exceed it;
    // no-scrollbar hides the scrollbar cross-browser.
    "max-w-full overflow-x-auto",
    "no-scrollbar",

    // Base
    "text-[var(--muted-foreground)]",

    // Vertical orientation support
    "data-[orientation=vertical]:flex-col",
    "data-[orientation=vertical]:w-auto",
    "data-[orientation=vertical]:max-w-none",
    "data-[orientation=vertical]:overflow-x-visible",
    "data-[orientation=vertical]:overflow-y-auto",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── Segmented control ─────────────────────── */
        default: [
          // w-fit: grey background wraps content only,
          // never stretches in flex-col parent
          "w-fit",
          "gap-1 p-1",
          "rounded-[var(--radius)]",
          "bg-[var(--muted)]",
        ].join(" "),

        /* ── Underline tabs ────────────────────────── */
        line: [
          // w-full: underline tabs span full container
          // (industry standard — Stripe, Linear, Vercel)
          "w-full",
          "gap-0",
          "bg-transparent rounded-none",
          "border-b border-[var(--border)]",
        ].join(" "),

        /* ── Pill tabs ─────────────────────────────── */
        pills: [
          // w-fit: pill group stays content-sized
          "w-fit",
          "gap-1.5",
          "bg-transparent",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const tabsTriggerVariants = cva(
  [
    // Layout
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap relative",
    "shrink-0",
    "cursor-pointer select-none",

    // Typography
    "font-medium",
    "text-[var(--muted-foreground)]",

    // GROUP 1: TACTILE PRESS (150ms)
    "transition-[background-color,color,border-color,box-shadow,transform]",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    "active:scale-[0.985]",

    // Focus
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--focus-ring)]",

    // Disabled
    "disabled:pointer-events-none",
    "disabled:opacity-50",

    // Icons
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg]:size-4",

    // Accessibility
    "motion-reduce:transition-none",
    "motion-reduce:active:scale-100",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── Segmented control ─────────────────────── */
        default: [
          "rounded-[var(--radius-sm)]",

          // Inactive hover
          "data-[state=inactive]:hover:bg-[var(--background)]",
          "data-[state=inactive]:hover:text-[var(--foreground)]",

          // Active — primary fill
          "data-[state=active]:bg-[var(--primary)]",
          "data-[state=active]:text-[var(--primary-foreground)]",
          "data-[state=active]:shadow-[var(--shadow-sm)]",
        ].join(" "),

        /* ── Underline tabs ────────────────────────── */
        line: [
          "rounded-none bg-transparent",

          // Inactive hover
          "data-[state=inactive]:hover:text-[var(--foreground)]",

          // Active — primary text, no background
          "data-[state=active]:bg-transparent",
          "data-[state=active]:text-[var(--primary)]",

          // Animated underline
          "after:absolute after:inset-x-0 after:bottom-0",
          "after:h-0.5 after:rounded-full",
          "after:bg-[var(--primary)]",
          "after:origin-center after:scale-x-0",
          "after:transition-transform after:duration-150",
          "after:[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          "data-[state=active]:after:scale-x-100",
          "motion-reduce:after:transition-none",
        ].join(" "),

        /* ── Pill tabs ─────────────────────────────── */
        pills: [
          "rounded-full",
          "border border-[var(--border)]",
          "bg-transparent",

          // Inactive hover
          "data-[state=inactive]:hover:bg-[var(--muted)]",
          "data-[state=inactive]:hover:text-[var(--foreground)]",

          // Active — primary fill
          "data-[state=active]:bg-[var(--primary)]",
          "data-[state=active]:text-[var(--primary-foreground)]",
          "data-[state=active]:border-[var(--primary)]",
          "data-[state=active]:shadow-[var(--shadow-sm)]",
        ].join(" "),
      },

      size: {
        sm: "h-9 px-3 text-[13px]",
        default: "h-11 md:h-10 px-4 text-sm",
        lg: "h-12 md:h-11 px-5 text-[15px]",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const tabsContentVariants = cva(
  [
    "flex-1",
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--focus-ring)]",
    "focus-visible:ring-offset-2",
  ].join(" "),
);

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> { }

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
  VariantProps<typeof tabsListVariants> {
  size?: TabsSize;
}

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
  VariantProps<typeof tabsTriggerVariants> { }

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> { }

/* ════════════════════════════════════════════════════════
   COMPONENTS
   ════════════════════════════════════════════════════════ */

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    data-slot="tabs"
    className={cn(
      "flex gap-3",
      "data-[orientation=horizontal]:flex-col",
      "data-[orientation=vertical]:flex-row",
      className,
    )}
    {...props}
  />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <TabsVariantContext.Provider
    value={{ variant: variant ?? "default", size: size ?? "default" }}
  >
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  </TabsVariantContext.Provider>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, ...props }, ref) => {
  const ctx = React.useContext(TabsVariantContext);

  const resolvedVariant = variant ?? ctx.variant ?? "default";
  const resolvedSize = size ?? ctx.size ?? "default";

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerVariants({
          variant: resolvedVariant,
          size: resolvedSize,
        }),
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn(tabsContentVariants(), className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/* ════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════ */

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
};

export type { TabsVariant, TabsSize };
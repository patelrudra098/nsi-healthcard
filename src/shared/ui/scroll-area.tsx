"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   SCROLL AREA
   GROUP 8: TABLE INTERACTIONS — scrollbar opacity (150ms)
   ════════════════════════════════════════════════════════ */

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      // ✅ group/scroll-area — enables hover-show on scrollbar
      className={cn("relative overflow-hidden group/scroll-area", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          // Layout
          "size-full rounded-[inherit]",

          // Focus — GROUP 6: FORM FOCUS pattern
          "outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--focus-ring)]",
          "focus-visible:ring-offset-2",
          "ring-offset-[var(--background)]",
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* ✅ Vertical scrollbar */}
      <ScrollBar orientation="vertical" />

      {/* ✅ Horizontal scrollbar */}
      <ScrollBar orientation="horizontal" />

      {/* Corner — only visible when both scrollbars exist */}
      <ScrollAreaPrimitive.Corner className="bg-[var(--muted)]" />
    </ScrollAreaPrimitive.Root>
  );
}

/* ════════════════════════════════════════════════════════
   SCROLL BAR
   ════════════════════════════════════════════════════════ */

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        // Layout & interaction
        "flex touch-none select-none",
        "p-px",

        // GROUP 8: Scrollbar opacity fade (150ms)
        "transition-[opacity] duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        "motion-reduce:transition-none",

        // Hidden at rest, visible on scroll or container hover
        "opacity-0",
        "data-[state=visible]:opacity-100",
        // ✅ group/scroll-area now actually exists on Root
        "group-hover/scroll-area:opacity-100",

        // ── Vertical ──────────────────────────────────
        orientation === "vertical" && [
          "h-full w-2 flex-col",
          "border-l border-l-transparent",
        ],

        // ── Horizontal ────────────────────────────────
        orientation === "horizontal" && [
          "h-2 w-full flex-row",
          "border-t border-t-transparent",
        ],

        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          // Shape
          "relative flex-1 rounded-full",

          // Color
          "bg-[var(--border)]",

          // GROUP 8: Thumb color feedback (150ms)
          "transition-colors duration-150",
          "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          "motion-reduce:transition-none",

          // Hover + active drag feedback
          "hover:bg-[var(--muted-foreground)]/40",
          "active:bg-[var(--muted-foreground)]/60",
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
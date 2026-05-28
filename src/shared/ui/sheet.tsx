"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
   CONTENT VARIANTS
   
   Ultra-smooth slide with modern shadows.
   450ms open feels luxurious but still responsive.
   ═══════════════════════════════════════════════════════ */

const sheetContentVariants = cva(
  [
    "fixed z-50 flex flex-col",
    "bg-[var(--card)] text-[var(--card-foreground)]",
    
    /* Modern elevated shadow */
    "[box-shadow:var(--shadow-xl)]",

    /* GPU acceleration */
    "[will-change:transform,opacity]",
    "[backface-visibility:hidden]",

    /* ═══ OPEN: Buttery smooth slide + fade ═══ */
    "data-[state=open]:animate-in",
    "data-[state=open]:fade-in-0",
    "data-[state=open]:duration-[450ms]",
    /* Spring-like deceleration */
    "data-[state=open]:[animation-timing-function:cubic-bezier(0.16,1,0.3,1)]",

    /* ═══ CLOSE: Quick smooth exit ═══ */
    "data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0",
    "data-[state=closed]:duration-[250ms]",
    /* Gentle acceleration */
    "data-[state=closed]:[animation-timing-function:cubic-bezier(0.3,0,0.8,0.15)]",

    "motion-reduce:animate-none",
  ],
  {
    variants: {
      side: {
        right: [
          "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
          "border-l border-[var(--border)]",
          "data-[state=open]:slide-in-from-right",
          "data-[state=closed]:slide-out-to-right",
        ],
        left: [
          "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
          "border-r border-[var(--border)]",
          "data-[state=open]:slide-in-from-left",
          "data-[state=closed]:slide-out-to-left",
        ],
        top: [
          "inset-x-0 top-0 w-full max-h-[85vh]",
          "border-b border-[var(--border)]",
          "data-[state=open]:slide-in-from-top",
          "data-[state=closed]:slide-out-to-top",
        ],
        bottom: [
          "inset-x-0 bottom-0 w-full max-h-[85vh]",
          "border-t border-[var(--border)]",
          "data-[state=open]:slide-in-from-bottom",
          "data-[state=closed]:slide-out-to-bottom",
        ],
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  showCloseButton?: boolean;
  /**
   * Whether clicking outside closes the sheet.
   * @default true (industry standard for sheets)
   */
  modal?: boolean;
}

/* ═══════════════════════════════════════════════════════
   ROOTS
   ═══════════════════════════════════════════════════════ */

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

/* ═══════════════════════════════════════════════════════
   CONTENT
   ═══════════════════════════════════════════════════════ */

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    { 
      className, 
      side = "right", 
      children, 
      showCloseButton = true,
      modal = true, // Allow outside click to close by default
      ...props 
    },
    ref,
  ) => (
    <SheetPortal>
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetContentVariants({ side }), className)}
        onInteractOutside={modal ? undefined : (e) => e.preventDefault()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            className={cn(
              "absolute right-4 top-4 z-10",
              "flex h-8 w-8 items-center justify-center",
              "rounded-[var(--radius-sm)]",
              "text-[var(--muted-foreground)]",
              
              /* Smooth micro-interactions */
              "transition-all duration-200",
              "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
              
              "hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              "active:scale-95",
              
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
              
              "disabled:pointer-events-none disabled:opacity-50",
              "motion-reduce:transition-none",
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = "SheetContent";

/* ═══════════════════════════════════════════════════════
   SUB-PARTS
   ═══════════════════════════════════════════════════════ */

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-6 text-left", className)}
    {...props}
  />
));
SheetHeader.displayName = "SheetHeader";

const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto flex flex-col gap-2 p-6 pt-0", className)}
    {...props}
  />
));
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--muted-foreground)]", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
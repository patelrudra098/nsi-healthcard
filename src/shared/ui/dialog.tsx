"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

/* ═══════════════════════════════════════════════════════
   OVERLAY (backdrop)
   ═══════════════════════════════════════════════════════ */

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-40",
      "bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/* ═══════════════════════════════════════════════════════
   CONTENT
   
   Modern zoom with subtle scale.
   Elevated shadow for focus and hierarchy.
   ═══════════════════════════════════════════════════════ */

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    /**
     * Whether clicking outside closes the dialog.
     * @default false (industry standard - dialogs require explicit action)
     */
    modal?: boolean;
  }
>(({ className, children, showCloseButton = true, modal = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        /* ═══ POSITIONING ═══ */
        "fixed left-1/2 top-1/2 z-50",
        "-translate-x-1/2 -translate-y-1/2",

        /* ═══ GPU ACCELERATION ═══ */
        "[will-change:transform,opacity]",
        "[backface-visibility:hidden]",

        /* ═══ DIMENSIONS ═══ */
        "w-[calc(100%-2rem)] max-w-lg",
        "max-h-[min(calc(100vh-4rem),850px)]",

        /* ═══ SURFACE ═══ */
        "bg-[var(--card)]",
        "border border-[var(--border)]",
        "rounded-[var(--radius-lg)]",

        /* Modern elevated shadow */
        "[box-shadow:var(--shadow-xl)]",

        /* ═══ LAYOUT ═══ */
        "flex flex-col overflow-hidden p-0",

        /* ═══ OPEN: Smooth scale + fade ═══ */
        "data-[state=open]:animate-in",
        "data-[state=open]:fade-in-0",
        "data-[state=open]:zoom-in-95",
        "data-[state=open]:duration-[350ms]",
        /* Spring-like deceleration */
        "data-[state=open]:[animation-timing-function:cubic-bezier(0.16,1,0.3,1)]",

        /* ═══ CLOSE: Quick smooth exit ═══ */
        "data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0",
        "data-[state=closed]:zoom-out-95",
        "data-[state=closed]:duration-[200ms]",
        /* Gentle acceleration */
        "data-[state=closed]:[animation-timing-function:cubic-bezier(0.3,0,0.8,0.15)]",

        /* ═══ TRANSFORM ORIGIN ═══ */
        "origin-center",

        "motion-reduce:animate-none",
        className,
      )}
      onInteractOutside={modal ? undefined : (e) => e.preventDefault()}
      {...props}
    >
      {children}

      {showCloseButton && (
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 z-10",
            "flex h-7 w-7 items-center justify-center",
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
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/* ═══════════════════════════════════════════════════════
   SUB-PARTS
   ═══════════════════════════════════════════════════════ */

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-1.5 text-center sm:text-left shrink-0",
      "p-6 pb-4 border-b border-[var(--border)] bg-[var(--card)] z-10",
      className,
    )}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 overflow-y-auto p-6 space-y-4",
      className,
    )}
    {...props}
  />
));
DialogBody.displayName = "DialogBody";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end shrink-0",
      "p-6 pt-4 border-t border-[var(--border)] bg-[var(--muted)/30] z-10",
      className,
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      "text-[var(--card-foreground)]",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--muted-foreground)]", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   VARIANTS
   ════════════════════════════════════════════════════════ */

const selectTriggerVariants = cva(
  [
    // Layout
    "flex w-full items-center justify-between gap-2",
    "whitespace-nowrap",

    // Design tokens
    "border border-[var(--border)]",
    "bg-[var(--card)]",
    "shadow-[var(--shadow-sm)]",

    // Typography
    "text-sm text-[var(--foreground)]",

    // GROUP 6: FORM FOCUS (150ms)
    "transition-[border-color,box-shadow] duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",

    // Focus styles
    "outline-none",
    "focus:border-[var(--ring)]",
    "focus:ring-2",
    "focus:ring-[var(--focus-ring)]",

    // Placeholder state
    "data-[placeholder]:text-[var(--muted-foreground)]",

    // Cursor
    "cursor-pointer",

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
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
        default: "h-11 md:h-10 px-5 md:px-4 text-sm rounded-[var(--radius)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const selectContentVariants = cva(
  [
    // Surface — MATCH DropdownMenu exactly
    "bg-[var(--surface)] text-[var(--text-primary)]",
    "border border-[var(--border)]",
    "shadow-[var(--shadow-lg)]",

    // Layout
    "z-50 max-h-96 min-w-[12rem] overflow-hidden",
    "rounded-[var(--radius)] p-1",

    // Animation — GROUP 2A: Small Popovers
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",

    // Directional slide IN based on side
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=top]:slide-in-from-bottom-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=left]:slide-in-from-right-2",

    // Directional slide OUT based on side
    "data-[state=closed]:data-[side=bottom]:slide-out-to-top-2",
    "data-[state=closed]:data-[side=top]:slide-out-to-bottom-2",
    "data-[state=closed]:data-[side=right]:slide-out-to-left-2",
    "data-[state=closed]:data-[side=left]:slide-out-to-right-2",

    // Transform origin based on side (for natural zoom)
    "data-[side=bottom]:origin-top",
    "data-[side=top]:origin-bottom",
    "data-[side=right]:origin-left",
    "data-[side=left]:origin-right",

    // Duration — 200ms open, 150ms close
    "data-[state=open]:duration-200",
    "data-[state=closed]:duration-150",

    // Curve
    "[animation-timing-function:cubic-bezier(0,0,0.2,1)]",

    // Accessibility
    "motion-reduce:animate-none",
  ].join(" "),
);

const selectItemVariants = cva(
  [
    // Layout — pl-8 reserves space for left-side check indicator
    "relative flex items-center gap-2",
    "w-full cursor-pointer select-none",
    "rounded-[var(--radius-sm)] pl-8 pr-2 py-1.5",

    // Typography
    "text-sm text-[var(--text-secondary)]",
    "outline-none",

    // Transition — GROUP 4: State Transition
    "transition-colors",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    "motion-reduce:transition-none",

    // Icons
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg]:size-4",
    "[&_svg]:text-[var(--text-muted)]",

    // Disabled state
    "data-[disabled]:pointer-events-none",
    "data-[disabled]:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "data-[highlighted]:bg-[var(--accent)]",
          "data-[highlighted]:text-[var(--accent-foreground)]",
          "[&_svg]:data-[highlighted]:text-[var(--accent-foreground)]",
        ].join(" "),

        primary: [
          "data-[highlighted]:bg-[var(--primary-soft)]",
          "data-[highlighted]:text-[var(--primary)]",
          "[&_svg]:data-[highlighted]:text-[var(--primary)]",
        ].join(" "),

        success: [
          "data-[highlighted]:bg-[var(--success-soft)]",
          "data-[highlighted]:text-[var(--success)]",
          "[&_svg]:data-[highlighted]:text-[var(--success)]",
        ].join(" "),

        warning: [
          "data-[highlighted]:bg-[var(--warning-soft)]",
          "data-[highlighted]:text-[var(--warning)]",
          "[&_svg]:data-[highlighted]:text-[var(--warning)]",
        ].join(" "),

        destructive: [
          "data-[highlighted]:bg-[var(--error-soft)]",
          "data-[highlighted]:text-[var(--error)]",
          "[&_svg]:data-[highlighted]:text-[var(--error)]",
        ].join(" "),

        muted: [
          "text-[var(--text-muted)]",
          "[&_svg]:text-[var(--text-muted)]",
          "data-[highlighted]:bg-[var(--muted)]",
          "data-[highlighted]:text-[var(--text-secondary)]",
        ].join(" "),
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
);

const selectLabelVariants = cva(
  [
    "px-2 py-1.5",
    "text-xs font-semibold",
    "text-[var(--text-muted)]",
    "select-none",
  ].join(" "),
  {
    variants: {
      inset: {
        true: "pl-8",
        false: "",
      },
    },
    defaultVariants: {
      inset: false,
    },
  },
);

const selectSeparatorVariants = cva(
  [
    "-mx-1 my-1 h-px",
    "bg-[var(--border)]",
  ].join(" "),
);

const selectShortcutVariants = cva(
  [
    "ml-auto text-xs tracking-widest",
    "text-[var(--text-muted)]",
  ].join(" "),
);

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  /**
   * Render Radix's hover-to-scroll buttons at top/bottom of the viewport.
   * Set to `false` for native wheel/touch scrolling (no auto-scroll on hover).
   * @default true
   */
  scrollButtons?: boolean
}

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
    VariantProps<typeof selectItemVariants> {}

export interface SelectLabelProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>,
    VariantProps<typeof selectLabelVariants> {}

export interface SelectSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}

export interface SelectShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

/* ════════════════════════════════════════════════════════
   ROOT COMPONENTS (Pass-through)
   ════════════════════════════════════════════════════════ */

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

/* ════════════════════════════════════════════════════════
   SELECT TRIGGER
   ════════════════════════════════════════════════════════ */

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, size, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    className={cn(selectTriggerVariants({ size }), className)}
    {...props}
  >
    <span className="flex-1 truncate text-left">{children}</span>
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="size-4 shrink-0 opacity-50" aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/* ════════════════════════════════════════════════════════
   SELECT SCROLL BUTTONS
   ════════════════════════════════════════════════════════ */

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(
      // Layout
      "flex cursor-default items-center justify-center py-1",

      // GROUP 4: STATE TRANSITION (150ms)
      "transition-colors duration-150",
      "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
      "hover:bg-[var(--accent)]",
      "motion-reduce:transition-none",

      className,
    )}
    {...props}
  >
    <ChevronUpIcon className="size-4" aria-hidden="true" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn(
      // Layout
      "flex cursor-default items-center justify-center py-1",

      // GROUP 4: STATE TRANSITION (150ms)
      "transition-colors duration-150",
      "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
      "hover:bg-[var(--accent)]",
      "motion-reduce:transition-none",

      className,
    )}
    {...props}
  >
    <ChevronDownIcon className="size-4" aria-hidden="true" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

/* ════════════════════════════════════════════════════════
   SELECT CONTENT
   ════════════════════════════════════════════════════════ */

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
  (
    {
      className,
      children,
      position = "popper",
      sideOffset = 4,
      scrollButtons = true,
      ...props
    },
    ref,
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        className={cn(selectContentVariants(), className)}
        position={position}
        sideOffset={sideOffset}
        {...props}
      >
        {scrollButtons && <SelectScrollUpButton />}
        <SelectPrimitive.Viewport
          data-slot="select-viewport"
          className={cn(
            position === "popper" && scrollButtons &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
            position === "popper" && !scrollButtons &&
              "w-full min-w-[var(--radix-select-trigger-width)]",
            !scrollButtons &&
              "max-h-[var(--radix-select-content-available-height)] overflow-y-auto overscroll-contain",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        {scrollButtons && <SelectScrollDownButton />}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

/* ═════════════��══════════════════════════════════════════
   SELECT LABEL
   ════════════════════════════════════════════════════════ */

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(({ className, inset, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(selectLabelVariants({ inset }), className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

/* ════════════════════════════════════════════════════════
   SELECT ITEM
   ════════════════════════════════════════════════════════ */

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, variant, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(selectItemVariants({ variant }), className)}
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

/* ════════════════════════════════════════════════════════
   SELECT SEPARATOR
   ════════════════════════════════════════════════════════ */

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn(selectSeparatorVariants(), className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

/* ════════════════════════════════════════════════════════
   SELECT SHORTCUT
   ════════════════════════════════════════════════════════ */

const SelectShortcut = React.forwardRef<HTMLSpanElement, SelectShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="select-shortcut"
      className={cn(selectShortcutVariants(), className)}
      {...props}
    />
  ),
);
SelectShortcut.displayName = "SelectShortcut";

/* ════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════ */

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectShortcut,
  selectTriggerVariants,
  selectContentVariants,
  selectItemVariants,
  selectLabelVariants,
  selectSeparatorVariants,
  selectShortcutVariants,
};
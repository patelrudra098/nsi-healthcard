"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   VARIANTS
   ════════════════════════════════════════════════════════ */

const dropdownMenuContentVariants = cva(
  [
    // Surface
    "bg-[var(--surface)] text-[var(--text-primary)]",
    "border border-[var(--border)]",
    "shadow-[var(--shadow-lg)]",

    // Layout
    "z-50 min-w-[12rem] overflow-hidden",
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

    // Duration — 200ms open, 150ms close (FIXED)
    "data-[state=open]:duration-200",
    "data-[state=closed]:duration-150",

    // Curve (FIXED)
    "[animation-timing-function:cubic-bezier(0,0,0.2,1)]",

    // Accessibility
    "motion-reduce:animate-none",
  ].join(" "),
);

const dropdownMenuItemVariants = cva(
  [
    // Layout
    "relative flex items-center gap-2",
    "w-full cursor-default select-none",
    "rounded-[var(--radius-sm)] px-2 py-1.5",

    // Typography
    "text-sm text-[var(--text-secondary)]",
    "outline-none",

    // Transition — GROUP 4: State Transition (FIXED)
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

      inset: {
        true: "pl-8",
        false: "",
      },
    },

    defaultVariants: {
      variant: "default",
      inset: false,
    },
  },
);

const dropdownMenuLabelVariants = cva(
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

const dropdownMenuSeparatorVariants = cva([
  "-mx-1 my-1 h-px",
  "bg-[var(--border)]",
].join(" "));

const dropdownMenuShortcutVariants = cva([
  "ml-auto text-xs tracking-widest",
  "text-[var(--text-muted)]",
].join(" "));

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof dropdownMenuContentVariants> {}

export interface DropdownMenuSubContentProps
  extends React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.SubContent
  > {}

export interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuItemVariants> {}

export interface DropdownMenuCheckboxItemProps
  extends React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.CheckboxItem
  > {
  variant?: DropdownMenuItemProps["variant"];
}

export interface DropdownMenuRadioItemProps
  extends React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.RadioItem
  > {
  variant?: DropdownMenuItemProps["variant"];
}

export interface DropdownMenuLabelProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>,
    VariantProps<typeof dropdownMenuLabelVariants> {}

export interface DropdownMenuSeparatorProps
  extends React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.Separator
  > {}

export interface DropdownMenuShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export interface DropdownMenuSubTriggerProps
  extends React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.SubTrigger
  > {
  inset?: boolean;
  variant?: DropdownMenuItemProps["variant"];
}

/* ════════════════════════════════════════════════════════
   ROOT COMPONENTS (Pass-through)
   ════════════════════════════════════════════════════════ */

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU CONTENT
   ════════════════════════════════════════════════════════ */

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      data-slot="dropdown-menu-content"
      sideOffset={sideOffset}
      className={cn(dropdownMenuContentVariants(), className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU SUB CONTENT
   ════════════════════════════════════════════════════════ */

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      data-slot="dropdown-menu-sub-content"
      className={cn(dropdownMenuContentVariants(), className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU ITEM
   ════════════════════════════════════════════════════════ */

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, variant, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    data-slot="dropdown-menu-item"
    className={cn(dropdownMenuItemVariants({ variant, inset }), className)}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU CHECKBOX ITEM
   ════════════════════════════════════════════════════════ */

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, checked, variant, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    data-slot="dropdown-menu-checkbox-item"
    className={cn(dropdownMenuItemVariants({ variant }), "pl-8", className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="size-4" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU RADIO ITEM
   ════════════════════════════════════════════════════════ */

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, variant, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    data-slot="dropdown-menu-radio-item"
    className={cn(dropdownMenuItemVariants({ variant }), "pl-8", className)}
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="size-2 fill-current" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName =
  DropdownMenuPrimitive.RadioItem.displayName;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU LABEL
   ════════════════════════════════════════════════════════ */

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    data-slot="dropdown-menu-label"
    className={cn(dropdownMenuLabelVariants({ inset }), className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU SEPARATOR
   ════════════════════════════════════════════════════════ */

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={cn(dropdownMenuSeparatorVariants(), className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName =
  DropdownMenuPrimitive.Separator.displayName;

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU SHORTCUT
   ════════════════════════════════════════════════════════ */

const DropdownMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  DropdownMenuShortcutProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="dropdown-menu-shortcut"
    className={cn(dropdownMenuShortcutVariants(), className)}
    {...props}
  />
));
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

/* ════════════════════════════════════════════════════════
   DROPDOWN MENU SUB TRIGGER
   ════════════════════════════════════════════════════════ */

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, inset, variant, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    data-slot="dropdown-menu-sub-trigger"
    className={cn(
      dropdownMenuItemVariants({ variant, inset }),
      "data-[state=open]:bg-[var(--accent)]",
      "data-[state=open]:text-[var(--accent-foreground)]",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto size-4" aria-hidden="true" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

/* ════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════ */

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
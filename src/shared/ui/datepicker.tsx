"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { CalendarDays, X } from "lucide-react";
import { Calendar, type CalendarProps } from "@/shared/ui/calendar";

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface DatePickerProps
    extends Omit<CalendarProps, "className" | "disabled"> {
    placeholder?: string;
    size?: "sm" | "default" | "lg";
    /** "input" = full-width trigger  |  "icon" = calendar icon button only */
    triggerVariant?: "input" | "icon";
    clearable?: boolean;
    error?: boolean;
    isDisabled?: boolean;
    formatDate?: (date: Date) => string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    calendarClassName?: string;
    /** Pass disabled-date fn to Calendar */
    disabledDates?: (date: Date) => boolean;
}

/* ════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════ */

const triggerSizes = {
    sm: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
    default: "h-11 md:h-10 px-5 md:px-4 text-sm rounded-[var(--radius)]",
    lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
} as const;

const iconSizes = {
    sm: "h-9 w-9 rounded-[var(--radius-sm)]",
    default: "h-10 w-10 rounded-[var(--radius)]",
    lg: "h-11 w-11 rounded-[var(--radius-md)]",
} as const;

/* ════════════════════════════════════════════════════════
   FORMATTER
   ════════════════════════════════════════════════════════ */

function defaultFormat(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

/* ════════════════════════════════════════════════════════
   SHARED POPOVER CONTENT CLASSES
   ════════════════════════════════════════════════════════ */

const popoverContentClass = cn(
    "z-50",
    "rounded-[var(--radius)] border border-[var(--border)]",
    "bg-[var(--card)]",
    "shadow-[var(--shadow-md)]",
    "outline-none",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98]",
    "data-[side=bottom]:slide-in-from-top-1",
    "data-[side=top]:slide-in-from-bottom-1",
    "duration-150",
);

/* ════════════════════════════════════════════════════════
   SHARED TRIGGER BORDER/RING CLASSES
   ════════════════════════════════════════════════════════ */

function getTriggerClass({
    size,
    error,
    isOpen,
    isDisabled,
    extra,
}: {
    size: "sm" | "default" | "lg";
    error: boolean;
    isOpen: boolean;
    isDisabled: boolean;
    extra?: string;
}) {
    return cn(
        "border bg-[var(--card)]",
        "shadow-[var(--shadow-sm)]",
        "transition-[border-color,box-shadow] duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        "motion-reduce:transition-none",
        "cursor-pointer",
        "focus-visible:outline-none",

        // Border color
        error ? "border-[var(--destructive)]" : "border-[var(--input)]",

        // Hover
        !error &&
        !isOpen &&
        "hover:border-[color-mix(in_srgb,var(--ring)_40%,transparent)]",

        // Focus / open
        "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        "focus-visible:ring-offset-2 ring-offset-[var(--background)]",
        isOpen &&
        !error && [
            "border-[var(--ring)]",
            "ring-2 ring-[var(--focus-ring)]",
            "ring-offset-2 ring-offset-[var(--background)]",
        ],

        // Error open
        isOpen && error && "ring-2 ring-[color-mix(in_srgb,var(--destructive)_25%,transparent)]",

        // Disabled
        isDisabled && [
            "pointer-events-none cursor-not-allowed",
            "opacity-50 bg-[var(--muted)]",
        ],

        extra,
    );
}

/* ════════════════════════════════════════════════════════
   DATE PICKER
   ════════════════════════════════════════════════════════ */

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
    (
        {
            value,
            onChange,
            min,
            max,
            disabledDates,
            weekStartsOn,
            showToday,
            placeholder = "Pick a date",
            size = "default",
            triggerVariant = "input",
            clearable = true,
            error = false,
            isDisabled = false,
            formatDate = defaultFormat,
            open: controlledOpen,
            onOpenChange,
            className,
            calendarClassName,
        },
        ref,
    ) => {
        const isControlled = controlledOpen !== undefined;
        const [internalOpen, setInternalOpen] = React.useState(false);
        const isOpen = isControlled ? controlledOpen! : internalOpen;

        const handleOpenChange = (next: boolean) => {
            if (!isControlled) setInternalOpen(next);
            onOpenChange?.(next);
        };

        const handleSelect = (date: Date | undefined) => {
            onChange?.(date);
            if (date) handleOpenChange(false);
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange?.(undefined);
        };

        /* ── Icon-only trigger ─────────────────── */
        if (triggerVariant === "icon") {
            return (
                <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            ref={ref}
                            type="button"
                            disabled={isDisabled}
                            aria-label={
                                value ? `Selected: ${formatDate(value)}` : "Open date picker"
                            }
                            className={getTriggerClass({
                                size,
                                error,
                                isOpen,
                                isDisabled,
                                extra: cn(
                                    "inline-flex items-center justify-center",
                                    iconSizes[size as "sm" | "default" | "lg"],
                                    "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                                    className,
                                ),
                            })}
                        >
                            <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </PopoverPrimitive.Trigger>

                    <PopoverPrimitive.Portal>
                        <PopoverPrimitive.Content
                            align="start"
                            sideOffset={4}
                            collisionPadding={12}
                            className={popoverContentClass}
                        >
                            <Calendar
                                value={value}
                                onChange={handleSelect}
                                min={min}
                                max={max}
                                disabled={disabledDates}
                                weekStartsOn={weekStartsOn}
                                showToday={showToday}
                                className={calendarClassName}
                            />
                        </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
            );
        }

        /* ── Full-width input trigger ──────────── */
        return (
            <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
                <PopoverPrimitive.Trigger asChild>
                    <button
                        ref={ref}
                        type="button"
                        disabled={isDisabled}
                        aria-label={value ? `Selected: ${formatDate(value)}` : placeholder}
                        aria-haspopup="dialog"
                        aria-expanded={isOpen}
                        className={getTriggerClass({
                            size,
                            error,
                            isOpen,
                            isDisabled,
                            extra: cn(
                                "flex w-full items-center gap-2",
                                triggerSizes[size as "sm" | "default" | "lg"],
                                className,
                            ),
                        })}
                    >
                        <CalendarDays
                            className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]"
                            aria-hidden="true"
                        />

                        <span
                            className={cn(
                                "flex-1 text-left truncate",
                                value
                                    ? "text-[var(--foreground)]"
                                    : "text-[var(--muted-foreground)]",
                            )}
                        >
                            {value ? formatDate(value) : placeholder}
                        </span>

                        {clearable && value && (
                            <span
                                role="button"
                                tabIndex={-1}
                                onClick={handleClear}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") handleClear(e as never);
                                }}
                                aria-label="Clear date"
                                className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                    "text-[var(--muted-foreground)]",
                                    "transition-colors duration-150",
                                    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
                                    "hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                                    "motion-reduce:transition-none",
                                )}
                            >
                                <X className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </button>
                </PopoverPrimitive.Trigger>

                <PopoverPrimitive.Portal>
                    <PopoverPrimitive.Content
                        align="start"
                        sideOffset={4}
                        collisionPadding={12}
                        className={popoverContentClass}
                    >
                        <Calendar
                            value={value}
                            onChange={handleSelect}
                            min={min}
                            max={max}
                            disabled={disabledDates}
                            weekStartsOn={weekStartsOn}
                            showToday={showToday}
                            className={calendarClassName}
                        />
                    </PopoverPrimitive.Content>
                </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
        );
    },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
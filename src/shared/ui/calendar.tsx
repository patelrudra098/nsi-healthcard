"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════ */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const WEEKDAYS_SUN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const WEEKDAYS_MON = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

/* ════════════════════════════════════════════════════════
   DATE UTILITIES — no external deps
   ════════════════════════════════════════════════════════ */

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function isDateDisabled(
  date: Date,
  min?: Date,
  max?: Date,
  fn?: (d: Date) => boolean,
): boolean {
  if (min) {
    const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    if (date < minDay) return true;
  }
  if (max) {
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    if (date > maxDay) return true;
  }
  return fn?.(date) ?? false;
}

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

type CalendarView = "days" | "months" | "years";

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  min?: Date;
  max?: Date;
  disabled?: (date: Date) => boolean;
  weekStartsOn?: 0 | 1;
  showToday?: boolean;
  className?: string;
}

/* ════════════════════════════════════════════════════════
   SHARED STYLES
   ════════════════════════════════════════════════════════ */

const navBtnClass = cn(
  "inline-flex items-center justify-center",
  "h-8 w-8 rounded-[var(--radius-sm)]",
  "text-[var(--muted-foreground)]",
  "cursor-pointer",
  "transition-colors duration-150",
  "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
  "hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
  "active:scale-[0.96]",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-[var(--focus-ring)]",
  "motion-reduce:transition-none",
);

const headerLabelClass = cn(
  "px-1.5 py-1 rounded-[var(--radius-sm)]",
  "text-sm font-semibold text-[var(--foreground)]",
  "cursor-pointer select-none",
  "transition-colors duration-150",
  "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
  "hover:bg-[var(--muted)]",
  "focus-visible:outline-2 focus-visible:outline-offset-1",
  "focus-visible:outline-[var(--focus-ring)]",
);

const gridCellClass = cn(
  "inline-flex items-center justify-center",
  "rounded-[var(--radius-sm)]",
  "text-sm font-medium",
  "cursor-pointer select-none",
  "transition-colors duration-150",
  "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
  "motion-reduce:transition-none",
  "focus-visible:outline-2 focus-visible:outline-offset-1",
  "focus-visible:outline-[var(--focus-ring)]",
);

/* ════════════════════════════════════════════════════════
   CALENDAR COMPONENT
   ════════════════════════════════════════════════════════ */

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      disabled: disabledFn,
      weekStartsOn = 0,
      showToday = true,
      className,
    },
    ref,
  ) => {
    const calendarRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => calendarRef.current!);

    /* ── State ──────────────────────────────── */

    const [viewDate, setViewDate] = React.useState<Date>(() => {
      const d = value ?? new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [view, setView] = React.useState<CalendarView>("days");
    const [decadeStart, setDecadeStart] = React.useState<number>(() =>
      Math.floor((value ?? new Date()).getFullYear() / 10) * 10,
    );

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Sync view when value changes externally
    const valueKey = value
      ? `${value.getFullYear()}-${value.getMonth()}`
      : null;

    React.useEffect(() => {
      if (value) {
        setViewDate((prev) => {
          if (
            prev.getFullYear() === value.getFullYear() &&
            prev.getMonth() === value.getMonth()
          )
            return prev;
          return new Date(value.getFullYear(), value.getMonth(), 1);
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueKey]);

    /* ── Navigation handlers ────────────────── */

    const navigate = (direction: -1 | 1) => {
      if (view === "days") {
        setViewDate(new Date(year, month + direction, 1));
      } else if (view === "months") {
        setViewDate(new Date(year + direction, month, 1));
      } else {
        setDecadeStart((s) => s + direction * 10);
      }
    };

    const selectMonth = (m: number) => {
      setViewDate(new Date(year, m, 1));
      setView("days");
    };

    const selectYear = (y: number) => {
      setViewDate(new Date(y, month, 1));
      setView("months");
    };

    const selectDay = (date: Date) => {
      if (isDateDisabled(date, min, max, disabledFn)) return;
      onChange?.(date);
    };

    const goToToday = () => {
      const today = new Date();
      setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
      onChange?.(today);
    };

    /* ── Day grid builder ───────────────────── */

    const buildDayGrid = React.useCallback(() => {
      const daysInMonth = getDaysInMonth(year, month);
      const daysInPrevMonth = getDaysInMonth(year, month - 1);
      let firstDay = new Date(year, month, 1).getDay();
      if (weekStartsOn === 1) firstDay = firstDay === 0 ? 6 : firstDay - 1;

      type DayCell = {
        date: Date;
        inMonth: boolean;
        disabled: boolean;
        selected: boolean;
        today: boolean;
      };

      const cells: DayCell[] = [];

      // Previous month fill
      for (let i = firstDay - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i);
        cells.push({
          date: d,
          inMonth: false,
          disabled: isDateDisabled(d, min, max, disabledFn),
          selected: value ? isSameDay(d, value) : false,
          today: isToday(d),
        });
      }

      // Current month
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        cells.push({
          date: d,
          inMonth: true,
          disabled: isDateDisabled(d, min, max, disabledFn),
          selected: value ? isSameDay(d, value) : false,
          today: isToday(d),
        });
      }

      // Next month fill (always 42 cells = 6 rows)
      const remaining = 42 - cells.length;
      for (let day = 1; day <= remaining; day++) {
        const d = new Date(year, month + 1, day);
        cells.push({
          date: d,
          inMonth: false,
          disabled: isDateDisabled(d, min, max, disabledFn),
          selected: value ? isSameDay(d, value) : false,
          today: isToday(d),
        });
      }

      return cells;
    }, [year, month, value, min, max, disabledFn, weekStartsOn]);

    const days = view === "days" ? buildDayGrid() : [];
    const weekdays = weekStartsOn === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN;

    /* ── Keyboard navigation (day grid) ─────── */

    const handleDayKeyDown = (e: React.KeyboardEvent, date: Date) => {
      let next: Date | null = null;

      switch (e.key) {
        case "ArrowLeft":
          next = addDays(date, -1);
          break;
        case "ArrowRight":
          next = addDays(date, 1);
          break;
        case "ArrowUp":
          next = addDays(date, -7);
          break;
        case "ArrowDown":
          next = addDays(date, 7);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          selectDay(date);
          return;
        default:
          return;
      }

      if (next) {
        e.preventDefault();
        if (next.getMonth() !== month || next.getFullYear() !== year) {
          setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
        }
        const key = toDateKey(next);
        setTimeout(() => {
          const btn = calendarRef.current?.querySelector(
            `[data-date="${key}"]`,
          ) as HTMLButtonElement | null;
          btn?.focus();
        }, 0);
      }
    };

    /* ── Year grid data ─────────────────────── */

    const yearCells = React.useMemo(
      () =>
        Array.from({ length: 12 }, (_, i) => {
          const y = decadeStart - 1 + i;
          return {
            year: y,
            isOutside: y < decadeStart || y > decadeStart + 9,
            isCurrent: y === year,
            isDisabled:
              (min ? y < min.getFullYear() : false) ||
              (max ? y > max.getFullYear() : false),
          };
        }),
      [decadeStart, year, min, max],
    );

    /* ── Render ─────────────────────────────── */

    return (
      <div
        ref={calendarRef}
        className={cn("w-[280px] p-3 select-none", className)}
        role="application"
        aria-label="Date picker"
      >
        {/* ── Header ───────────────────────── */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={navBtnClass}
            aria-label={
              view === "days"
                ? "Previous month"
                : view === "months"
                  ? "Previous year"
                  : "Previous decade"
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-0.5">
            {view === "days" && (
              <>
                <button
                  type="button"
                  onClick={() => setView("months")}
                  className={headerLabelClass}
                >
                  {MONTHS[month]}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecadeStart(Math.floor(year / 10) * 10);
                    setView("years");
                  }}
                  className={headerLabelClass}
                >
                  {year}
                </button>
              </>
            )}
            {view === "months" && (
              <button
                type="button"
                onClick={() => {
                  setDecadeStart(Math.floor(year / 10) * 10);
                  setView("years");
                }}
                className={headerLabelClass}
              >
                {year}
              </button>
            )}
            {view === "years" && (
              <span className="text-sm font-semibold text-[var(--foreground)] px-1.5 py-1">
                {decadeStart} – {decadeStart + 9}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(1)}
            className={navBtnClass}
            aria-label={
              view === "days"
                ? "Next month"
                : view === "months"
                  ? "Next year"
                  : "Next decade"
            }
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ── Days View ────────────────────── */}
        {view === "days" && (
          <div
            role="grid"
            aria-label={`${MONTHS[month]} ${year}`}
          >
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-0.5" role="row">
              {weekdays.map((wd) => (
                <div
                  key={wd}
                  role="columnheader"
                  className="flex items-center justify-center h-9 text-xs font-medium text-[var(--muted-foreground)]"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7" role="rowgroup">
              {days.map((cell, i) => {
                const key = toDateKey(cell.date);
                const isTabbable =
                  cell.inMonth &&
                  (value
                    ? isSameDay(cell.date, value)
                    : cell.date.getDate() === 1);

                return (
                  <button
                    key={i}
                    type="button"
                    role="gridcell"
                    data-date={key}
                    disabled={cell.disabled}
                    tabIndex={isTabbable ? 0 : -1}
                    onClick={() => selectDay(cell.date)}
                    onKeyDown={(e) => handleDayKeyDown(e, cell.date)}
                    aria-selected={cell.selected}
                    aria-disabled={cell.disabled}
                    aria-label={cell.date.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    className={cn(
                      "h-9 w-full",
                      gridCellClass,
                      // Outside month
                      !cell.inMonth && "text-[var(--text-disabled)]",
                      // In month, normal
                      cell.inMonth &&
                        !cell.selected &&
                        !cell.today &&
                        "text-[var(--foreground)]",
                      // Today (not selected)
                      cell.today &&
                        !cell.selected &&
                        "bg-[var(--muted)] text-[var(--foreground)] font-semibold",
                      // Selected
                      cell.selected && [
                        "bg-[var(--primary)] text-[var(--primary-foreground)]",
                        "font-semibold shadow-[var(--shadow-sm)]",
                        "hover:bg-[var(--primary-hover)]",
                      ],
                      // Hover (not selected, not disabled)
                      !cell.selected &&
                        !cell.disabled &&
                        "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
                      // Disabled
                      cell.disabled &&
                        "opacity-40 cursor-not-allowed hover:bg-transparent",
                    )}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Months View ──────────────────── */}
        {view === "months" && (
          <div
            className="grid grid-cols-3 gap-1 py-1"
            role="listbox"
            aria-label="Select month"
          >
            {MONTHS_SHORT.map((name, i) => {
              const isCurrent = i === month;
              const isDisabled = (() => {
                if (min) {
                  const lastDay = new Date(year, i + 1, 0);
                  if (
                    lastDay <
                    new Date(min.getFullYear(), min.getMonth(), min.getDate())
                  )
                    return true;
                }
                if (max) {
                  const firstDay = new Date(year, i, 1);
                  if (
                    firstDay >
                    new Date(max.getFullYear(), max.getMonth(), max.getDate())
                  )
                    return true;
                }
                return false;
              })();

              return (
                <button
                  key={name}
                  type="button"
                  role="option"
                  disabled={isDisabled}
                  aria-selected={isCurrent}
                  onClick={() => selectMonth(i)}
                  className={cn(
                    "h-10",
                    gridCellClass,
                    isCurrent
                      ? [
                          "bg-[var(--primary)] text-[var(--primary-foreground)]",
                          "font-semibold shadow-[var(--shadow-sm)]",
                          "hover:bg-[var(--primary-hover)]",
                        ]
                      : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
                    isDisabled &&
                      "opacity-40 cursor-not-allowed hover:bg-transparent",
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Years View ───────────────────── */}
        {view === "years" && (
          <div
            className="grid grid-cols-3 gap-1 py-1"
            role="listbox"
            aria-label="Select year"
          >
            {yearCells.map((cell) => (
              <button
                key={cell.year}
                type="button"
                role="option"
                disabled={cell.isDisabled}
                aria-selected={cell.isCurrent}
                onClick={() => selectYear(cell.year)}
                className={cn(
                  "h-10",
                  gridCellClass,
                  cell.isCurrent
                    ? [
                        "bg-[var(--primary)] text-[var(--primary-foreground)]",
                        "font-semibold shadow-[var(--shadow-sm)]",
                        "hover:bg-[var(--primary-hover)]",
                      ]
                    : cell.isOutside
                      ? "text-[var(--text-disabled)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                      : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
                  cell.isDisabled &&
                    "opacity-40 cursor-not-allowed hover:bg-transparent",
                )}
              >
                {cell.year}
              </button>
            ))}
          </div>
        )}

        {/* ── Today shortcut ───────────────── */}
        {showToday && view === "days" && (
          <div className="mt-1.5 pt-1.5 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={goToToday}
              className={cn(
                "w-full h-8 rounded-[var(--radius-sm)]",
                "text-xs font-medium",
                "text-[var(--primary)]",
                "cursor-pointer",
                "transition-colors duration-150",
                "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
                "hover:bg-[var(--accent)]",
                "focus-visible:outline-2 focus-visible:outline-offset-1",
                "focus-visible:outline-[var(--focus-ring)]",
              )}
            >
              Today
            </button>
          </div>
        )}
      </div>
    );
  },
);

Calendar.displayName = "Calendar";

export { Calendar };
export type { CalendarView };
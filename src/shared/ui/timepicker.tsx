"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Clock, X } from "lucide-react";

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface TimeValue {
    hours: number;
    minutes: number;
    seconds?: number;
}

export interface TimePickerProps {
    value?: TimeValue;
    onChange?: (time: TimeValue | undefined) => void;
    showSeconds?: boolean;
    use12Hour?: boolean;
    minuteStep?: number;
    placeholder?: string;
    size?: "sm" | "default" | "lg";
    error?: boolean;
    isDisabled?: boolean;
    triggerVariant?: "input" | "icon";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

/* ════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════ */

const ITEM_H = 44;
const VISIBLE = 5;
const REPEAT = 41; // More repetitions for smoother infinite scroll
const DRUM_H = VISIBLE * ITEM_H;
const GHOST_ROWS = Math.floor(VISIBLE / 2); // 2

/* ════════════════════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════════════════════ */

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

function formatTime(v: TimeValue, use12: boolean, showSec: boolean): string {
    if (use12) {
        const period = v.hours >= 12 ? "PM" : "AM";
        const h = v.hours % 12 || 12;
        const base = `${pad(h)}:${pad(v.minutes)}`;
        return showSec
            ? `${base}:${pad(v.seconds ?? 0)} ${period}`
            : `${base} ${period}`;
    }
    const base = `${pad(v.hours)}:${pad(v.minutes)}`;
    return showSec ? `${base}:${pad(v.seconds ?? 0)}` : base;
}

function buildHourItems(use12: boolean): number[] {
    return use12
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : Array.from({ length: 24 }, (_, i) => i);
}

function buildMinuteItems(step: number): number[] {
    const count = Math.floor(60 / step);
    return Array.from({ length: count }, (_, i) => i * step);
}

function buildSecondItems(): number[] {
    return Array.from({ length: 60 }, (_, i) => i);
}

/* ════════════════════════════════════════════════════════
   DRUM COLUMN — Industry-standard infinite scroll drum
   
   KEY PRINCIPLES:
   • Each wheel tick = exactly 1 item (no skipping)
   • Wheel accumulator with threshold prevents over-scroll
   • RAF-based smooth snap after scroll ends
   • Touch support with proper velocity clamping
   • Instant recenter in middle copy (invisible to user)
   ════════════════════════════════════════════════════════ */

interface DrumColumnProps {
    value: number;
    items: number[];
    label: string;
    onChange: (v: number) => void;
    fmt?: (v: number) => string;
}

function DrumColumn({
    value,
    items,
    label,
    onChange,
    fmt = pad,
}: DrumColumnProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Refs for scroll management
    const isSilent = React.useRef(false);
    const snapRaf = React.useRef<number | null>(null);
    const snapTid = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const committedValue = React.useRef(value);
    const isScrolling = React.useRef(false);

    // Wheel accumulator — prevents skipping
    const wheelAcc = React.useRef(0);
    const wheelTid = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Touch tracking
    const touchStartY = React.useRef(0);
    const touchLastY = React.useRef(0);
    const touchVelocity = React.useRef(0);
    const touchTid = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const len = items.length;

    /* Infinite item list */
    const infinite = React.useMemo(
        () => Array.from({ length: REPEAT }, () => items).flat(),
        [items]
    );

    const midStart = Math.floor(REPEAT / 2) * len;

    /* ── Helpers ───────────────────────────────────────── */
    const visualCentreRef = React.useRef(-1);

    const updateVisualCenter = React.useCallback((forceIdx?: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const ci = forceIdx !== undefined ? forceIdx : Math.round(el.scrollTop / ITEM_H);
        if (visualCentreRef.current === ci) return;
        
        const oldActive = el.children[visualCentreRef.current] as HTMLElement;
        if (oldActive) oldActive.setAttribute("data-active", "false");
        
        const newActive = el.children[ci] as HTMLElement;
        if (newActive) newActive.setAttribute("data-active", "true");
        
        visualCentreRef.current = ci;
    }, []);

    const topFor = React.useCallback((i: number) => i * ITEM_H, []);

    const centreIdx = React.useCallback(
        (el: HTMLDivElement) => Math.round(el.scrollTop / ITEM_H),
        []
    );

    /* ── Cancel pending snap ───────────────────────────── */
    const cancelSnap = React.useCallback(() => {
        if (snapRaf.current) {
            cancelAnimationFrame(snapRaf.current);
            snapRaf.current = null;
        }
        if (snapTid.current) {
            clearTimeout(snapTid.current);
            snapTid.current = null;
        }
    }, []);

    /* ── Scroll to index (smooth or instant) ───────────── */
    const scrollToIdx = React.useCallback(
        (i: number, behavior: ScrollBehavior = "smooth") => {
            const el = scrollRef.current;
            if (!el) return;
            const top = topFor(Math.max(0, Math.min(i, infinite.length - 1)));
            if (behavior === "instant") {
                isSilent.current = true;
                el.scrollTop = top;
                // Force layout flush
                void el.scrollTop;
                updateVisualCenter();
                isSilent.current = false;
            } else {
                el.scrollTo({ top, behavior });
            }
        },
        [topFor, infinite.length, updateVisualCenter]
    );

    /* ── Find closest copy of value to current position ── */
    const closestIdxFor = React.useCallback(
        (v: number, el: HTMLDivElement) => {
            const cur = centreIdx(el);
            const realIdx = items.indexOf(v);
            if (realIdx === -1) return midStart + realIdx;
            const curCopy = Math.floor(cur / len);
            let best = curCopy * len + realIdx;
            // Check ±2 copies for closest
            for (let offset = -2; offset <= 2; offset++) {
                const candidate = (curCopy + offset) * len + realIdx;
                if (
                    candidate >= 0 &&
                    candidate < infinite.length &&
                    Math.abs(candidate - cur) < Math.abs(best - cur)
                ) {
                    best = candidate;
                }
            }
            return Math.max(0, Math.min(best, infinite.length - 1));
        },
        [centreIdx, infinite.length, items, len, midStart]
    );

    /* ── Silent recenter to middle copy ──────────────────── */
    const recenterSilent = React.useCallback(() => {
        const el = scrollRef.current;
        if (!el || isSilent.current) return;
        const ci = centreIdx(el);
        const realIdx = ((ci % len) + len) % len;
        const target = midStart + realIdx;
        if (Math.abs(ci - target) < 2) return; // Already centred
        scrollToIdx(target, "instant");
    }, [centreIdx, len, midStart, scrollToIdx]);

    /* ── Commit current centre value ─────────────────────── */
    const commitCentre = React.useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const ci = centreIdx(el);
        const realIdx = ((ci % len) + len) % len;
        const next = items[realIdx];

        // Snap to exact grid position
        scrollToIdx(ci, "smooth");

        if (next !== undefined && next !== committedValue.current) {
            committedValue.current = next;
            onChange(next);
        }

        // Recenter silently after smooth snap settles
        snapTid.current = setTimeout(() => {
            recenterSilent();
        }, 300);
    }, [centreIdx, items, len, onChange, recenterSilent, scrollToIdx]);

    /* ── Mount: jump to correct position ─────────────────── */
    React.useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const realIdx = Math.max(0, items.indexOf(value));
        const targetIdx = midStart + realIdx;
        isSilent.current = true;
        el.scrollTop = topFor(targetIdx);
        void el.scrollTop;
        updateVisualCenter(targetIdx);
        isSilent.current = false;
        committedValue.current = value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── External value change ────────────────────────────── */
    React.useEffect(() => {
        if (committedValue.current === value) return;
        committedValue.current = value;
        const el = scrollRef.current;
        if (!el) return;
        const idx = closestIdxFor(value, el);
        scrollToIdx(idx, "smooth");
    }, [value, scrollToIdx, closestIdxFor]);

    /* ── onScroll handler ─────────────────────────────────── */
    const handleScroll = React.useCallback(() => {
        updateVisualCenter();
        if (isSilent.current) return;
        isScrolling.current = true;
        cancelSnap();
        snapTid.current = setTimeout(() => {
            isScrolling.current = false;
            commitCentre();
        }, 100);
    }, [cancelSnap, commitCentre, updateVisualCenter]);

    /* ════════════════════════════════════════════════════
       WHEEL — THE KEY FIX
       
       Problem: trackpad fires many small deltaY events rapidly,
       mouse wheel fires fewer but larger deltaY events.
       
       Solution: Accumulate delta with a threshold (ITEM_H / 3).
       Each threshold crossed = exactly 1 item scroll.
       Reset accumulator after brief pause.
       ════════════════════════════════════════════════════ */
    React.useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const THRESHOLD = ITEM_H / 3; // ~14.7px per step

        const handler = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Normalize delta — different browsers report different scales
            let delta = e.deltaY;

            // Normalize mode (Firefox uses DOM_DELTA_LINE = 1)
            if (e.deltaMode === 1) {
                // Line mode — each unit = ~16px
                delta *= 16;
            } else if (e.deltaMode === 2) {
                // Page mode
                delta *= DRUM_H;
            }

            // Accumulate
            wheelAcc.current += delta;

            // How many steps did we cross?
            const steps = Math.trunc(wheelAcc.current / THRESHOLD);

            if (steps !== 0) {
                // Consume the stepped portion
                wheelAcc.current -= steps * THRESHOLD;

                const ci = centreIdx(el);
                // Clamp to 1 step at a time for mouse wheel feel
                // Allow up to 1 step per event for precise control
                const clampedSteps = Math.sign(steps) * Math.min(Math.abs(steps), 1);
                const targetIdx = Math.max(
                    0,
                    Math.min(ci + clampedSteps, infinite.length - 1)
                );

                cancelSnap();
                isSilent.current = true;
                el.scrollTop = topFor(targetIdx);
                void el.scrollTop;
                updateVisualCenter(targetIdx);
                isSilent.current = false;

                // Commit after brief pause
                cancelSnap();
                snapTid.current = setTimeout(() => {
                    commitCentre();
                }, 150);
            }

            // Reset accumulator after wheel ends
            if (wheelTid.current) clearTimeout(wheelTid.current);
            wheelTid.current = setTimeout(() => {
                wheelAcc.current = 0;
            }, 200);
        };

        el.addEventListener("wheel", handler, { passive: false });
        return () => {
            el.removeEventListener("wheel", handler);
            if (wheelTid.current) clearTimeout(wheelTid.current);
        };
    }, [cancelSnap, centreIdx, commitCentre, infinite.length, topFor, updateVisualCenter]);

    /* ── Touch support ────────────────────────────────────── */
    React.useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onTouchStart = (e: TouchEvent) => {
            touchStartY.current = e.touches[0].clientY;
            touchLastY.current = e.touches[0].clientY;
            touchVelocity.current = 0;
            cancelSnap();
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const y = e.touches[0].clientY;
            const dy = touchLastY.current - y;
            touchVelocity.current = dy;
            touchLastY.current = y;

            const ci = centreIdx(el);
            // Scroll by pixel delta mapped to item steps
            const pixelDelta = touchStartY.current - y;
            const steps = Math.round(pixelDelta / ITEM_H);
            const startIdx = Math.round(
                (el.scrollTop - steps * ITEM_H + touchLastY.current - touchStartY.current) / ITEM_H
            );

            isSilent.current = true;
            el.scrollTop += dy;
            void el.scrollTop;
            updateVisualCenter();
            isSilent.current = false;
        };

        const onTouchEnd = () => {
            // Apply momentum — clamp velocity to max 3 items
            const momentumSteps = Math.sign(touchVelocity.current) *
                Math.min(Math.ceil(Math.abs(touchVelocity.current) / 10), 3);
            const ci = centreIdx(el);
            const targetIdx = Math.max(
                0,
                Math.min(ci + momentumSteps, infinite.length - 1)
            );

            el.scrollTo({ top: topFor(targetIdx), behavior: "smooth" });

            touchTid.current = setTimeout(() => {
                commitCentre();
            }, 350);
        };

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
            if (touchTid.current) clearTimeout(touchTid.current);
        };
    }, [cancelSnap, centreIdx, commitCentre, infinite.length, topFor, updateVisualCenter]);

    /* ── Keyboard ─────────────────────────────────────────── */
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            const el = scrollRef.current;
            if (!el) return;
            const ci = centreIdx(el);

            if (e.key === "ArrowUp") {
                e.preventDefault();
                cancelSnap();
                scrollToIdx(ci - 1, "smooth");
                snapTid.current = setTimeout(commitCentre, 150);
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                cancelSnap();
                scrollToIdx(ci + 1, "smooth");
                snapTid.current = setTimeout(commitCentre, 150);
            }
        },
        [cancelSnap, centreIdx, commitCentre, scrollToIdx]
    );

    /* ── Click a row ──────────────────────────────────────── */
    const handleClick = React.useCallback(
        (infiniteIdx: number) => {
            const el = scrollRef.current;
            if (!el) return;
            cancelSnap();
            scrollToIdx(infiniteIdx, "smooth");
            snapTid.current = setTimeout(commitCentre, 300);
        },
        [cancelSnap, commitCentre, scrollToIdx]
    );

    /* ── Render ───────────────────────────────────────────── */
    return (
        <div className="flex flex-col items-center gap-2 w-full" role="group">
            {/* Label */}
            <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {label}
            </span>

            {/* Drum shell */}
            <div
                className="relative w-full overflow-hidden rounded-[var(--radius-sm)]"
                style={{ height: DRUM_H }}
            >
                {/* Selection highlight — behind scroll (z-[1]) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 z-[1] rounded-[var(--radius-sm)] bg-[var(--primary-soft)]"
                    style={{ top: GHOST_ROWS * ITEM_H, height: ITEM_H }}
                />

                {/* Top fade (z-[3]) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-[3]"
                    style={{
                        height: GHOST_ROWS * ITEM_H,
                        background:
                            "linear-gradient(to bottom, var(--card) 20%, transparent 100%)",
                    }}
                />

                {/* Bottom fade (z-[3]) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[3]"
                    style={{
                        height: GHOST_ROWS * ITEM_H,
                        background:
                            "linear-gradient(to top, var(--card) 20%, transparent 100%)",
                    }}
                />

                {/* Scroll container (z-[2]) */}
                <div
                    ref={scrollRef}
                    role="spinbutton"
                    tabIndex={0}
                    aria-valuenow={value}
                    aria-valuemin={items[0]}
                    aria-valuemax={items[items.length - 1]}
                    aria-valuetext={fmt(value)}
                    aria-label={label}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "absolute inset-0 z-[2] overflow-y-scroll",
                        "overscroll-contain",
                        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset",
                        "focus-visible:ring-[var(--focus-ring)] rounded-[var(--radius-sm)]"
                    )}
                    style={{
                        paddingTop: GHOST_ROWS * ITEM_H,
                        paddingBottom: GHOST_ROWS * ITEM_H,
                        willChange: "scroll-position",
                        // Disable native snap — we handle it manually for precise control
                        scrollSnapType: "none",
                    }}
                >
                    {infinite.map((item, i) => {
                        const initialIdx = midStart + Math.max(0, items.indexOf(value));
                        const isActive = visualCentreRef.current !== -1 ? i === visualCentreRef.current : i === initialIdx;
                        return (
                            <div
                                key={i}
                                onClick={() => handleClick(i)}
                                data-active={isActive ? "true" : "false"}
                                style={{ height: ITEM_H }}
                                className={cn(
                                    "font-sans flex items-center justify-center w-full",
                                    "cursor-pointer select-none",
                                    "transition-[color,font-size,font-weight,opacity] duration-150",
                                    "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
                                    "motion-reduce:transition-none",
                                    "data-[active=true]:text-[var(--primary)]",
                                    "data-[active=true]:text-2xl data-[active=true]:font-bold data-[active=true]:tabular-nums data-[active=true]:tracking-tight",
                                    "data-[active=true]:opacity-100",
                                    "data-[active=false]:text-[var(--text-muted)]",
                                    "data-[active=false]:text-sm data-[active=false]:font-medium data-[active=false]:tabular-nums",
                                    "data-[active=false]:opacity-50",
                                    "data-[active=false]:hover:opacity-80 data-[active=false]:hover:text-[var(--text-secondary)]"
                                )}
                            >
                                {fmt(item)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   COLON
   ════════════════════════════════════════════════════════ */

function Colon() {
    return (
        <div
            className="flex shrink-0 flex-col items-center gap-2"
            aria-hidden="true"
        >
            <span className="text-[10px] font-semibold invisible select-none leading-none">
                HR
            </span>
            <div
                className="flex items-center justify-center"
                style={{ height: DRUM_H }}
            >
                <span className="text-base font-bold text-[var(--text-muted)] select-none leading-none">
                    :
                </span>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   AM / PM TOGGLE
   ════════════════════════════════════════════════════════ */

interface PeriodToggleProps {
    value: "AM" | "PM";
    onChange: (v: "AM" | "PM") => void;
}

function PeriodToggle({ value, onChange }: PeriodToggleProps) {
    const wrapRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            e.preventDefault();
            onChange(value === "AM" ? "PM" : "AM");
        };
        el.addEventListener("wheel", handler, { passive: false });
        return () => el.removeEventListener("wheel", handler);
    }, [value, onChange]);

    return (
        <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="text-[10px] font-semibold invisible select-none leading-none">
                HR
            </span>
            <div
                ref={wrapRef}
                className="flex items-center justify-center"
                style={{ height: DRUM_H }}
            >
                <div
                    role="radiogroup"
                    aria-label="AM or PM"
                    onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                            onChange(value === "AM" ? "PM" : "AM");
                        }
                    }}
                    className={cn(
                        "flex flex-col w-12 p-1 gap-1",
                        "rounded-[var(--radius-sm)]",
                        "bg-[var(--muted)]"
                    )}
                >
                    {(["AM", "PM"] as const).map((period) => {
                        const active = value === period;
                        return (
                            <button
                                key={period}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                tabIndex={active ? 0 : -1}
                                onClick={() => onChange(period)}
                                className={cn(
                                    "h-10 flex items-center justify-center",
                                    "rounded-[calc(var(--radius-sm)-2px)]",
                                    "font-sans text-xs font-bold tracking-wide",
                                    "cursor-pointer select-none",
                                    "transition-[background-color,color,box-shadow] duration-200",
                                    "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
                                    "focus-visible:ring-2 focus-visible:ring-offset-1",
                                    "focus-visible:ring-[var(--focus-ring)]",
                                    "motion-reduce:transition-none",
                                    active
                                        ? [
                                            "bg-[var(--primary)]",
                                            "text-[var(--text-inverse)]",
                                            "shadow-[0_2px_8px_color-mix(in_srgb,var(--primary)_35%,transparent)]",
                                        ]
                                        : [
                                            "text-[var(--text-muted)]",
                                            "hover:bg-[var(--surface-hover)]",
                                            "hover:text-[var(--text-secondary)]",
                                        ]
                                )}
                            >
                                {period}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   TIME PICKER PANEL
   ════════════════════════════════════════════════════════ */

interface TimePickerPanelProps {
    value: TimeValue;
    onChange: (v: TimeValue) => void;
    onConfirm: () => void;
    showSeconds: boolean;
    use12Hour: boolean;
    minuteStep: number;
}

function TimePickerPanel({
    value,
    onChange,
    onConfirm,
    showSeconds,
    use12Hour,
    minuteStep,
}: TimePickerPanelProps) {
    const hourItems = React.useMemo(
        () => buildHourItems(use12Hour),
        [use12Hour]
    );
    const minuteItems = React.useMemo(
        () => buildMinuteItems(minuteStep),
        [minuteStep]
    );
    const secondItems = React.useMemo(buildSecondItems, []);

    const period = (value.hours >= 12 ? "PM" : "AM") as "AM" | "PM";
    const displayHour = use12Hour ? value.hours % 12 || 12 : value.hours;

    const setHour = React.useCallback(
        (h: number) => {
            if (use12Hour) {
                const pm = value.hours >= 12;
                const h24 = pm ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
                onChange({ ...value, hours: h24 });
            } else {
                onChange({ ...value, hours: h });
            }
        },
        [value, onChange, use12Hour]
    );

    const setMinute = React.useCallback(
        (m: number) => onChange({ ...value, minutes: m }),
        [value, onChange]
    );

    const setSecond = React.useCallback(
        (s: number) => onChange({ ...value, seconds: s }),
        [value, onChange]
    );

    const setPeriod = React.useCallback(
        (p: "AM" | "PM") => {
            const h = value.hours;
            const newH =
                p === "PM" ? (h < 12 ? h + 12 : h) : h >= 12 ? h - 12 : h;
            onChange({ ...value, hours: newH });
        },
        [value, onChange]
    );

    return (
        <div className="flex flex-col gap-4 p-5" style={{ width: 300 }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="font-heading text-sm font-semibold text-[var(--text-primary)]">
                    Select time
                </p>
                <span
                    className={cn(
                        "rounded-full px-2.5 py-0.5",
                        "bg-[var(--primary-soft)] text-[var(--primary)]",
                        "text-xs font-mono font-semibold tabular-nums tracking-tight"
                    )}
                >
                    {formatTime(value, use12Hour, showSeconds)}
                </span>
            </div>

            {/* Drums */}
            <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0">
                    <DrumColumn
                        value={displayHour}
                        items={hourItems}
                        label="Hour"
                        onChange={setHour}
                    />
                </div>

                <Colon />

                <div className="flex-1 min-w-0">
                    <DrumColumn
                        value={value.minutes}
                        items={minuteItems}
                        label="Min"
                        onChange={setMinute}
                    />
                </div>

                {showSeconds && (
                    <>
                        <Colon />
                        <div className="flex-1 min-w-0">
                            <DrumColumn
                                value={value.seconds ?? 0}
                                items={secondItems}
                                label="Sec"
                                onChange={setSecond}
                            />
                        </div>
                    </>
                )}

                {use12Hour && (
                    <>
                        <div
                            aria-hidden="true"
                            className="w-px self-stretch bg-[var(--border)] mx-0.5 rounded-full"
                        />
                        <PeriodToggle value={period} onChange={setPeriod} />
                    </>
                )}
            </div>

            {/* Divider */}
            <div className="-mx-4 h-px bg-[var(--border)]" aria-hidden="true" />

            {/* Apply button */}
            <button
                type="button"
                onClick={onConfirm}
                className={cn(
                    "h-10 w-full inline-flex items-center justify-center",
                    "rounded-[var(--radius-sm)]",
                    "font-sans text-sm font-semibold",
                    "bg-[var(--primary)] text-[var(--text-inverse)]",
                    "shadow-[var(--shadow-sm)]",
                    "cursor-pointer",
                    "transition-[background-color,box-shadow,transform] duration-150",
                    "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
                    "hover:bg-[var(--primary-hover)] hover:shadow-[var(--shadow-md)]",
                    "active:bg-[var(--primary-active)] active:scale-[0.985] active:shadow-none",
                    "focus-visible:outline-2 focus-visible:outline-offset-2",
                    "focus-visible:outline-[var(--focus-ring)]",
                    "motion-reduce:transition-none"
                )}
            >
                Apply
            </button>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   SHARED TRIGGER HELPERS
   ════════════════════════════════════════════════════════ */

const POPOVER_CLASS = cn(
    "z-50 outline-none",
    "rounded-[var(--radius)] border border-[var(--border)]",
    "bg-[var(--card)] shadow-[var(--shadow-md)]",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98]",
    "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
    "duration-150"
);

const TRIGGER_SIZES = {
    sm: "h-9  px-3   text-sm  rounded-[var(--radius-sm)]",
    default: "h-11 md:h-10 px-3.5 md:px-3 text-sm rounded-[var(--radius)]",
    lg: "h-12 px-4   text-base rounded-[var(--radius-md)]",
} as const;

const ICON_SIZES = {
    sm: "h-9  w-9  rounded-[var(--radius-sm)]",
    default: "h-10 w-10 rounded-[var(--radius)]",
    lg: "h-11 w-11 rounded-[var(--radius-md)]",
} as const;

function getTriggerClass(opts: {
    size: "sm" | "default" | "lg";
    error: boolean;
    isOpen: boolean;
    isDisabled: boolean;
    extra?: string;
}) {
    const { error, isOpen, isDisabled, extra } = opts;
    return cn(
        "border bg-[var(--card)] shadow-[var(--shadow-sm)]",
        "transition-[border-color,box-shadow] duration-150",
        "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
        "cursor-pointer focus-visible:outline-none",
        error ? "border-[var(--destructive)]" : "border-[var(--input)]",
        !error &&
        !isOpen &&
        "hover:border-[color-mix(in_srgb,var(--ring)_40%,transparent)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        "focus-visible:ring-offset-2 ring-offset-[var(--background)]",
        isOpen &&
        !error && [
            "border-[var(--ring)]",
            "ring-2 ring-[var(--focus-ring)]",
            "ring-offset-2 ring-offset-[var(--background)]",
        ],
        isOpen &&
        error &&
        "ring-2 ring-[color-mix(in_srgb,var(--destructive)_25%,transparent)]",
        isDisabled &&
        "pointer-events-none cursor-not-allowed opacity-50 bg-[var(--muted)]",
        extra
    );
}

function ClearButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
    return (
        <span
            role="button"
            tabIndex={-1}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(e as unknown as React.MouseEvent);
                }
            }}
            aria-label="Clear time"
            className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                "border-0 bg-transparent p-0 cursor-pointer",
                "text-[var(--text-muted)]",
                "transition-colors duration-150",
                "[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
                "hover:bg-[var(--muted)] hover:text-[var(--text-primary)]",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[var(--focus-ring)]",
                "motion-reduce:transition-none"
            )}
        >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
    );
}

/* ════════════════════════════════════════════════════════
   ROOT — TIME PICKER
   ════════════════════════════════════════════════════════ */

const DEFAULT_TIME: TimeValue = { hours: 9, minutes: 0, seconds: 0 };

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
    (
        {
            value,
            onChange,
            showSeconds = false,
            use12Hour = true,
            minuteStep = 1,
            placeholder = "Pick a time",
            size = "default",
            triggerVariant = "input",
            error = false,
            isDisabled = false,
            open: controlledOpen,
            onOpenChange,
            className,
        },
        ref
    ) => {
        const isControlled = controlledOpen !== undefined;
        const [internalOpen, setInternalOpen] = React.useState(false);
        const isOpen = isControlled ? controlledOpen! : internalOpen;
        const [draft, setDraft] = React.useState<TimeValue>(
            value ?? DEFAULT_TIME
        );

        React.useEffect(() => {
            if (value) setDraft(value);
        }, [value]);

        const handleOpenChange = React.useCallback(
            (next: boolean) => {
                if (next) setDraft(value ?? DEFAULT_TIME);
                if (!isControlled) setInternalOpen(next);
                onOpenChange?.(next);
            },
            [value, isControlled, onOpenChange]
        );

        const handleConfirm = React.useCallback(() => {
            onChange?.(draft);
            if (!isControlled) setInternalOpen(false);
            onOpenChange?.(false);
        }, [draft, onChange, isControlled, onOpenChange]);

        const handleClear = React.useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation();
                onChange?.(undefined);
            },
            [onChange]
        );

        const displayText = value
            ? formatTime(value, use12Hour, showSeconds)
            : placeholder;
        const hasValue = Boolean(value);

        const panel = (
            <TimePickerPanel
                value={draft}
                onChange={setDraft}
                onConfirm={handleConfirm}
                showSeconds={showSeconds}
                use12Hour={use12Hour}
                minuteStep={minuteStep}
            />
        );

        if (triggerVariant === "icon") {
            return (
                <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            ref={ref}
                            type="button"
                            disabled={isDisabled}
                            aria-label={
                                hasValue ? `Time: ${displayText}` : "Open time picker"
                            }
                            className={getTriggerClass({
                                size,
                                error,
                                isOpen,
                                isDisabled,
                                extra: cn(
                                    "inline-flex items-center justify-center",
                                    ICON_SIZES[size],
                                    "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                                    className
                                ),
                            })}
                        >
                            <Clock className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Portal>
                        <PopoverPrimitive.Content
                            role="dialog"
                            aria-label="Select time"
                            align="start"
                            sideOffset={4}
                            collisionPadding={12}
                            className={POPOVER_CLASS}
                        >
                            {panel}
                        </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
            );
        }

        return (
            <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
                <PopoverPrimitive.Trigger asChild>
                    <button
                        ref={ref}
                        type="button"
                        disabled={isDisabled}
                        aria-haspopup="dialog"
                        aria-expanded={isOpen}
                        aria-label={hasValue ? `Time: ${displayText}` : placeholder}
                        className={getTriggerClass({
                            size,
                            error,
                            isOpen,
                            isDisabled,
                            extra: cn(
                                "flex w-full items-center gap-2",
                                TRIGGER_SIZES[size],
                                className
                            ),
                        })}
                    >
                        <Clock
                            className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                            aria-hidden="true"
                        />
                        <span
                            className={cn(
                                "flex-1 text-left tabular-nums font-medium",
                                hasValue
                                    ? "text-[var(--text-primary)]"
                                    : "text-[var(--text-muted)]"
                            )}
                        >
                            {displayText}
                        </span>
                        {hasValue && <ClearButton onClick={handleClear} />}
                    </button>
                </PopoverPrimitive.Trigger>
                <PopoverPrimitive.Portal>
                    <PopoverPrimitive.Content
                        role="dialog"
                        aria-label="Select time"
                        align="start"
                        sideOffset={4}
                        collisionPadding={12}
                        className={POPOVER_CLASS}
                    >
                        {panel}
                    </PopoverPrimitive.Content>
                </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
        );
    }
);

TimePicker.displayName = "TimePicker";
export { TimePicker };
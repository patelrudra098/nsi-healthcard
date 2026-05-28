"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const SCORE_META = [
  { value: 1, label: "Poor", color: "var(--error)", soft: "var(--error-soft)" },
  { value: 2, label: "Weak", color: "var(--cat-amber)", soft: "var(--cat-amber-soft)" },
  { value: 3, label: "Average", color: "var(--warning)", soft: "var(--warning-soft)" },
  { value: 4, label: "Good", color: "var(--info)", soft: "var(--info-soft)" },
  { value: 5, label: "Excellent", color: "var(--success)", soft: "var(--success-soft)" },
] as const;

interface ScoreSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
  /** Accessible group label. */
  label: string;
}

/** Accessible 1–5 score picker (radiogroup with roving tabindex + arrow keys). */
export function ScoreSelector({ value, onChange, label }: ScoreSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusValue = (next: number) => {
    onChange(next);
    refs.current[next - 1]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, current: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusValue(current >= 5 ? 1 : current + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusValue(current <= 1 ? 5 : current - 1);
        break;
      case "Home":
        event.preventDefault();
        focusValue(1);
        break;
      case "End":
        event.preventDefault();
        focusValue(5);
        break;
    }
  };

  const roveTarget = value ?? 1;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-5 gap-1.5 sm:gap-2"
    >
      {SCORE_META.map((option, index) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${option.value} — ${option.label}`}
            tabIndex={option.value === roveTarget ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, option.value)}
            style={
              selected
                ? { backgroundColor: option.soft, borderColor: option.color, color: option.color }
                : undefined
            }
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border px-1 py-2.5 outline-none sm:py-3",
              "transition-[background-color,border-color,color,transform] duration-150 [transition-timing-function:cubic-bezier(0,0,0.2,1)]",
              "active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
              "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              !selected &&
                "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--border))] hover:bg-[var(--muted)]",
            )}
          >
            <span className="font-heading text-lg font-bold leading-none tabular-nums sm:text-xl">
              {option.value}
            </span>
            <span className="text-[10px] font-medium leading-none sm:text-[11px]">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

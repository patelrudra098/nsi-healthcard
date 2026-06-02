"use client";

import { useMemo, useRef } from "react";
import type { QuestionExample } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SCORE_META } from "./score-selector";

interface ScoreOptionsProps {
  value: number | null;
  onChange: (score: number) => void;
  examples: QuestionExample[];
  /** Accessible group label. */
  label: string;
}

const META_BY_LEVEL = new Map(SCORE_META.map((meta) => [meta.value, meta]));

/**
 * Descriptive 1–5 picker: each level is a full-width, ≥56px tappable card that
 * spells out what the score means. Accessible radiogroup with roving tabindex
 * and arrow-key navigation; colour-coded with the shared score ramp.
 */
export function ScoreOptions({ value, onChange, examples, label }: ScoreOptionsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const options = useMemo(
    () => [...examples].sort((a, b) => a.level - b.level),
    [examples],
  );

  const focusIndex = (index: number) => {
    const next = (index + options.length) % options.length;
    const level = options[next]?.level;
    if (level == null) return;
    onChange(level);
    refs.current[next]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        focusIndex(index + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        focusIndex(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusIndex(0);
        break;
      case "End":
        event.preventDefault();
        focusIndex(options.length - 1);
        break;
    }
  };

  const roveLevel = value ?? options[0]?.level ?? 1;

  return (
    <div role="radiogroup" aria-label={label} className="space-y-2">
      {options.map((example, index) => {
        const meta = META_BY_LEVEL.get(example.level);
        const color = meta?.color ?? "var(--primary)";
        const soft = meta?.soft ?? "var(--primary-soft)";
        const selected = value === example.level;

        return (
          <button
            key={example.level}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${example.level} — ${example.label}. ${example.description}`}
            tabIndex={example.level === roveLevel ? 0 : -1}
            onClick={() => onChange(example.level)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            style={selected ? { backgroundColor: soft, borderColor: color } : undefined}
            className={cn(
              "flex min-h-[56px] w-full items-start gap-3 rounded-[var(--radius-md)] border px-3.5 py-3 text-left outline-none",
              "transition-[background-color,border-color,transform] duration-150 [transition-timing-function:cubic-bezier(0,0,0.2,1)]",
              "active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
              "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              !selected &&
                "border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--border))] hover:bg-[var(--muted)]",
            )}
          >
            {/* Radio dot */}
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2"
              style={{ borderColor: selected ? color : "var(--border)" }}
            >
              {selected && (
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </span>

            {/* Content */}
            <span className="min-w-0">
              <span
                className="block text-sm font-semibold leading-tight"
                style={{ color: selected ? color : "var(--text-secondary)" }}
              >
                {example.level} — {example.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-sm leading-snug",
                  selected ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
                )}
              >
                {example.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScoreSelector } from "./score-selector";

interface QuestionCardProps {
  question: Question;
  index: number;
  value: number | null;
  onChange: (score: number) => void;
  /** Highlights the card when the user tried to advance without answering. */
  invalid?: boolean;
}

/** A single scored question with its Hindi hint and 1–5 selector. */
export function QuestionCard({
  question,
  index,
  value,
  onChange,
  invalid,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5",
        "transition-colors duration-150",
        invalid
          ? "border-[var(--destructive)]"
          : "border-[var(--border)]",
      )}
    >
      <div className="mb-4 flex gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
          {index + 1}
        </span>
        <div className="space-y-1">
          <p className="text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
            {question.text}
          </p>
          {question.hint && (
            <p className="text-sm leading-snug text-[var(--text-muted)]">
              {question.hint}
            </p>
          )}
        </div>
      </div>
      <ScoreSelector value={value} onChange={onChange} label={question.text} />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { ArrowRight, PartyPopper } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { CheckInPayload, HabitPlan, HabitRating } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { cn } from "@/lib/utils";
import { useSubmitCheckIn } from "../hooks";
import {
  OVERALL_EMOJIS,
  OVERALL_LABELS,
  RATING_LABELS,
  RATING_VALUES,
  activeHabits,
  sectionIcon,
} from "../constants";

interface CheckInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: HabitPlan;
  /** Called ~2s after a successful submit (e.g. to navigate). */
  onComplete?: () => void;
}

const CELEBRATION_MS = 2200;

/**
 * Inner form, mounted fresh each time the sheet opens (via `key`) so its
 * transient rating state always starts clean — no reset-in-effect needed.
 */
function CheckInForm({
  plan,
  onOpenChange,
  onComplete,
}: Omit<CheckInSheetProps, "open">) {
  const habits = useMemo(() => activeHabits(plan), [plan]);
  const submit = useSubmitCheckIn();

  const [ratings, setRatings] = useState<Record<string, HabitRating>>({});
  const [overall, setOverall] = useState<HabitRating | null>(null);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reassess, setReassess] = useState(false);

  // Once submitted, celebrate. A normal week hands control back to the parent
  // after a beat; the final (round-complete) check-in stays open so the user
  // can tap straight through to the reassessment.
  useEffect(() => {
    if (!done) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      confetti({
        particleCount: reassess ? 130 : 90,
        spread: reassess ? 90 : 75,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: ["#1568C0", "#0C7A4F", "#B5680A", "#6D28D9"],
      });
    }
    if (reassess) return;
    const timer = setTimeout(() => {
      onOpenChange(false);
      onComplete?.();
    }, CELEBRATION_MS);
    return () => clearTimeout(timer);
  }, [done, reassess, onOpenChange, onComplete]);

  const allRated =
    overall != null && habits.every((habit) => ratings[habit.id] != null);

  const handleSubmit = () => {
    if (!allRated) return;
    const payload: CheckInPayload = {
      habitPlanId: plan.id,
      habit1Rating: ratings[habits[0].id],
      overallRating: overall,
    };
    if (habits[1]) payload.habit2Rating = ratings[habits[1].id];
    if (habits[2]) payload.habit3Rating = ratings[habits[2].id];

    submit.mutate(payload, {
      onSuccess: (result) => {
        setMessage(
          result.encouragementMessage ??
            (result.shouldReassess
              ? "You've built a real habit. Now retake your health assessment to see your improvement and unlock your next challenge."
              : "Great work this week — every small step counts. Keep it going! 🎉"),
        );
        setReassess(result.shouldReassess);
        setDone(true);
      },
    });
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
          <PartyPopper className="size-8" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
          {reassess ? "Challenge complete! 🎉" : "Check-in saved!"}
        </h2>
        <p className="text-pretty max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
          {message}
        </p>
        {reassess && (
          <Button asChild size="lg" className="mt-2 w-full sm:w-auto sm:min-w-[16rem]">
            <Link href={ROUTES.welcome}>
              Retake assessment now
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <SheetHeader className="px-6">
        <SheetTitle className="font-heading text-xl">
          Week {plan.currentWeek} check-in
        </SheetTitle>
        <SheetDescription>
          How did your family do this week? Answer honestly — there are no wrong
          answers.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-2">
        {habits.map((habit) => (
          <fieldset key={habit.id} className="space-y-3">
            <legend className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <span aria-hidden="true">{sectionIcon(habit.sectionKey)}</span>
              {habit.title}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {RATING_VALUES.map((value) => {
                const selected = ratings[habit.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setRatings((prev) => ({ ...prev, [habit.id]: value }))
                    }
                    className={cn(
                      "rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                      selected
                        ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)] hover:bg-[var(--surface-hover)]",
                    )}
                  >
                    {RATING_LABELS[value]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <fieldset className="space-y-3 border-t border-[var(--border)] pt-5">
          <legend className="text-sm font-semibold text-[var(--text-primary)]">
            How does your family feel overall this week?
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {RATING_VALUES.map((value) => {
              const selected = overall === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setOverall(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-[var(--radius-md)] border px-2 py-3 transition-colors duration-150 motion-reduce:transition-none",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                    selected
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {OVERALL_EMOJIS[value]}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      selected ? "text-[var(--primary)]" : "text-[var(--text-muted)]",
                    )}
                  >
                    {OVERALL_LABELS[value]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="px-6 py-4">
        <Button
          size="lg"
          className="w-full"
          disabled={!allRated}
          isLoading={submit.isPending}
          onClick={handleSubmit}
        >
          Submit check-in
        </Button>
      </div>
    </>
  );
}

export function CheckInSheet({
  open,
  onOpenChange,
  plan,
  onComplete,
}: CheckInSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] rounded-t-[var(--radius-lg)]"
      >
        <div className="mx-auto flex w-full max-w-xl flex-col overflow-hidden">
          {open && (
            <CheckInForm
              key={plan.id}
              plan={plan}
              onOpenChange={onOpenChange}
              onComplete={onComplete}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

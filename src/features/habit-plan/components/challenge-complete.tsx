"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { ArrowRight, Check, PartyPopper } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { HabitPlan } from "@/lib/types";
import { Button } from "@/shared/ui/button";
import { primaryHabit, sectionLabel } from "../constants";

const BENEFITS = [
  "See how much your score improved",
  "Unlock your next 21-day challenge",
  "Track your family's health journey",
] as const;

/** Celebration shown on the plan page once the 21-day round is complete. */
export function ChallengeComplete({ plan }: { plan: HabitPlan }) {
  const fired = useRef(false);
  const habit = primaryHabit(plan);
  const focus = habit ? sectionLabel(habit.sectionKey) : null;

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fire = (x: number) =>
      confetti({
        particleCount: 80,
        spread: 72,
        startVelocity: 44,
        origin: { x, y: 0.35 },
        colors: ["#0C7A4F", "#1568C0", "#B5680A", "#6D28D9"],
      });
    fire(0.3);
    setTimeout(() => fire(0.7), 180);
  }, []);

  return (
    <section className="app-card overflow-hidden p-0 text-center">
      <div
        className="flex flex-col items-center gap-4 px-6 py-9 sm:px-10 sm:py-11"
        style={{
          background:
            "linear-gradient(160deg, var(--success-soft) 0%, var(--surface) 70%)",
        }}
      >
        <span className="grid size-16 place-items-center rounded-full bg-[var(--success)] text-[var(--text-inverse)] shadow-[var(--shadow-md)]">
          <PartyPopper className="size-8" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-[1.7rem]">
            21-Day Challenge Complete!
          </h2>
          <p className="text-pretty mx-auto max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            {plan.encouragementMessage ?? "You've built a real habit."}
            {focus ? ` Your ${focus.toLowerCase()} routine has changed for the better.` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-10">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Now retake your health assessment to:
        </p>
        <ul className="mx-auto max-w-sm space-y-2.5 text-left">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-sm text-[var(--text-secondary)]">{benefit}</span>
            </li>
          ))}
        </ul>
        <Button asChild size="lg" className="w-full sm:w-auto sm:min-w-[18rem]">
          <Link href={ROUTES.welcome}>
            Retake health assessment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

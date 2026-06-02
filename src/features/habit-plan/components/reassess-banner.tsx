"use client";

import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { Button } from "@/shared/ui/button";

/**
 * High-emphasis dashboard banner shown when a 21-day round is complete. Green
 * surface, white text — the single most important action on the screen.
 */
export function ReassessBanner({ message }: { message?: string | null }) {
  return (
    <section
      aria-label="Challenge complete"
      className="overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]"
      style={{
        background:
          "linear-gradient(135deg, var(--success) 0%, var(--success-active) 100%)",
      }}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-white">
            <PartyPopper className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-heading text-lg font-bold text-white">
              Your 21-day challenge is complete! 🎉
            </p>
            <p className="text-pretty text-sm leading-relaxed text-white/85">
              {message ??
                "Retake your health assessment to see your improvement and start your next habit."}
            </p>
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className="shrink-0 bg-white text-[var(--success)] shadow-[var(--shadow-sm)] hover:bg-white/90 hover:text-[var(--success-active)]"
        >
          <Link href={ROUTES.welcome}>
            Retake now
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

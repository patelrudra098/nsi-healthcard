"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarCheck, Hourglass, Sparkles } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { Button } from "@/shared/ui/button";
import { FlowShell } from "@/shared/layout";
import { EmptyState, ErrorState } from "@/shared/components";
import { useActiveHabitPlan } from "../hooks";
import { activeHabits, isCheckInDue } from "../constants";
import { JourneyHeader } from "../components/journey-header";
import { HabitCard } from "../components/habit-card";
import { NextUp } from "../components/next-up";
import { ChallengeComplete } from "../components/challenge-complete";
import { CheckInSheet } from "../components/check-in-sheet";
import { PlanGenerating } from "../components/plan-generating";

/** Minimum time the generating animation plays when arriving without a plan. */
const MIN_GENERATING_MS = 2200;
/** Poll roughly this many times for a freshly-generated plan before giving up. */
const MAX_POLLS = 6;

export function ImprovementPlanContainer() {
  const query = useActiveHabitPlan();
  const plan = query.data ?? null;
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  const habits = useMemo(() => (plan ? activeHabits(plan) : []), [plan]);

  // Play the full generating animation when the user explicitly starts a
  // challenge (?started=1) or when no plan exists yet. Casual revisits with a
  // cached plan stay instant.
  const searchParams = useSearchParams();
  const [playIntro] = useState(
    () => searchParams.get("started") === "1" || plan == null,
  );
  const [minElapsed, setMinElapsed] = useState(() => !playIntro);

  useEffect(() => {
    if (!playIntro) return;
    const timer = setTimeout(() => setMinElapsed(true), MIN_GENERATING_MS);
    return () => clearTimeout(timer);
  }, [playIntro]);

  // Generation runs server-side after an assessment — poll until it lands.
  const { refetch, isError } = query;
  useEffect(() => {
    if (plan || isError) return;
    let attempts = 0;
    const id = setInterval(() => {
      attempts += 1;
      void refetch();
      if (attempts >= MAX_POLLS) {
        clearInterval(id);
        setGaveUp(true);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [plan, isError, refetch]);

  if (query.isError) {
    return (
      <FlowShell width="wide" exitHref={ROUTES.dashboard} exitLabel="Dashboard">
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </FlowShell>
    );
  }

  // Still generating (or holding the animation for its minimum beat).
  if (!plan || (playIntro && !minElapsed)) {
    if (!plan && gaveUp) {
      return (
        <FlowShell width="wide" exitHref={ROUTES.dashboard} exitLabel="Dashboard">
          <div className="app-card p-8">
            <EmptyState
              icon={Hourglass}
              title="Your challenge is being prepared"
              description="We build your personalised 21-day challenge right after an assessment. Give it a moment and refresh."
              action={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => query.refetch()}
                    isLoading={query.isFetching}
                  >
                    Refresh
                  </Button>
                  <Button asChild>
                    <Link href={ROUTES.dashboard}>Back to dashboard</Link>
                  </Button>
                </div>
              }
            />
          </div>
        </FlowShell>
      );
    }
    return (
      <FlowShell width="wide" exitHref={ROUTES.dashboard} exitLabel="Dashboard">
        <PlanGenerating />
      </FlowShell>
    );
  }

  const due = isCheckInDue(plan);
  const complete = plan.shouldReassess;

  return (
    <FlowShell width="wide" exitHref={ROUTES.dashboard} exitLabel="Dashboard">
      <div className="space-y-7">
        <JourneyHeader plan={plan} />

        {complete ? (
          <>
            <ChallengeComplete plan={plan} />
            <NextUp sections={plan.nextWeakSections} />
          </>
        ) : (
          <>
            {plan.encouragementMessage && (
              <div
                className="flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5"
                style={{
                  backgroundColor: "var(--primary-soft)",
                  borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)",
                }}
              >
                <Sparkles className="mt-0.5 size-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {plan.encouragementMessage}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>

            <NextUp sections={plan.nextWeakSections} />

            <div className="sticky bottom-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {plan.status === "ACTIVE" && (
                <Button
                  size="lg"
                  onClick={() => setCheckInOpen(true)}
                  className="shadow-[var(--shadow-md)] sm:min-w-[15rem]"
                >
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  {due ? "Check in this week" : "Update this week's check-in"}
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href={ROUTES.dashboard}>
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>

      {!complete && (
        <CheckInSheet open={checkInOpen} onOpenChange={setCheckInOpen} plan={plan} />
      )}
    </FlowShell>
  );
}

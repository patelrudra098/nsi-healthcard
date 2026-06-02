"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarCheck, Flag, LineChart as LineChartIcon } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { HabitPlanStatus, WeeklyCheckIn } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { clampPercent } from "@/lib/score";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import {
  HabitCard,
  OVERALL_EMOJIS,
  OVERALL_LABELS,
  RATING_LABELS,
  ScoreHistoryChart,
  toRating,
} from "@/features/habit-plan";
import { useAdminHabitPlan } from "../hooks";

const STATUS_META: Record<
  HabitPlanStatus,
  { label: string; variant: "success" | "info" | "soft" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  COMPLETED: { label: "Completed", variant: "info" },
  ABANDONED: { label: "Abandoned", variant: "soft" },
};

function ratingText(value: number | null): string {
  const rating = toRating(value);
  return rating ? RATING_LABELS[rating] : "—";
}

function overallText(value: number): string {
  const rating = toRating(value);
  return rating ? `${OVERALL_EMOJIS[rating]} ${OVERALL_LABELS[rating]}` : "—";
}

export function AdminHabitPlanDetailContainer() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const query = useAdminHabitPlan(id);

  if (query.isLoading) return <LoadingState label="Loading habit plan…" />;
  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }
  if (!query.data) return <ErrorState title="Habit plan not found" />;

  const plan = query.data;
  const meta = STATUS_META[plan.status];
  const pct = clampPercent(plan.progressPercent);
  const totalDays = Math.max(plan.daysSinceStart + plan.daysRemaining, 90);
  const habits = [...plan.habits].sort((a, b) => a.month - b.month);
  const checkIns = [...plan.checkIns].sort((a, b) => a.weekNumber - b.weekNumber);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={ROUTES.adminHabitPlans}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            All habit plans
          </Link>
        </Button>
        <PageHeader
          title="Habit plan"
          description={
            <>
              By{" "}
              <Link
                href={ROUTES.adminUser(plan.user.id)}
                className="font-medium text-[var(--primary)] hover:underline"
              >
                {plan.user.name}
              </Link>{" "}
              · +91 {plan.user.mobile}
            </>
          }
          actions={
            <Badge variant={meta.variant} size="lg">
              {meta.label}
            </Badge>
          }
        />
      </div>

      <section className="app-card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Flag className="size-4 text-[var(--primary)]" aria-hidden="true" />
            Started{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {formatDate(plan.startDate)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck className="size-4 text-[var(--success)]" aria-hidden="true" />
            Target{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {formatDate(plan.targetDate)}
            </span>
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[var(--text-primary)]">
              {pct}% complete
            </span>
            <span className="tabular-nums text-[var(--text-muted)]">
              Day {Math.min(Math.max(plan.daysSinceStart, 0), totalDays)} of{" "}
              {totalDays}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Habits
        </h2>
        <div className="space-y-6">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </section>

      <section className="app-card space-y-5 p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Weekly check-ins
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Week</TableHead>
              <TableHead>Habit 1</TableHead>
              <TableHead>Habit 2</TableHead>
              <TableHead>Habit 3</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkIns.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                title="No check-ins yet"
                description="Weekly check-ins will appear here as the user logs them."
              />
            ) : (
              checkIns.map((checkIn: WeeklyCheckIn) => (
                <TableRow key={checkIn.weekNumber}>
                  <TableCell>
                    <span className="font-medium text-[var(--text-primary)]">
                      Week {checkIn.weekNumber}
                    </span>
                  </TableCell>
                  <TableCell>{ratingText(checkIn.habit1Rating)}</TableCell>
                  <TableCell>{ratingText(checkIn.habit2Rating)}</TableCell>
                  <TableCell>{ratingText(checkIn.habit3Rating)}</TableCell>
                  <TableCell>{overallText(checkIn.overallRating)}</TableCell>
                  <TableCell>{formatDate(checkIn.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="app-card space-y-5 p-6">
        <div className="flex items-center gap-2">
          <LineChartIcon className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Score history
          </h2>
        </div>
        <ScoreHistoryChart data={plan.scoreHistory ?? []} />
      </section>
    </div>
  );
}

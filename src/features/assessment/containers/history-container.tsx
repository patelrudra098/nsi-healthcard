"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardPlus } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { DashboardResponse, ScoreBandKey } from "@/lib/types";
import { bandFromPercentage } from "@/lib/score";
import { formatDate } from "@/lib/format";
import { Button } from "@/shared/ui/button";
import {
  BandBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { useDashboard } from "@/features/dashboard/hooks";

interface HistoryRow {
  assessmentId: string;
  completedAt: string;
  scorePercentage: number;
  scoreBand: ScoreBandKey;
  bandLabel: string;
}

/** Build a complete, de-duplicated, newest-first list from the dashboard data. */
function toRows(data: DashboardResponse): HistoryRow[] {
  const rows: HistoryRow[] = [];
  const seen = new Set<string>();

  const push = (row: HistoryRow) => {
    if (seen.has(row.assessmentId)) return;
    seen.add(row.assessmentId);
    rows.push(row);
  };

  if (data.latestAssessment) {
    const latest = data.latestAssessment;
    push({
      assessmentId: latest.assessmentId,
      completedAt: latest.completedAt,
      scorePercentage: latest.scorePercentage,
      scoreBand: latest.scoreBand,
      bandLabel: latest.bandLabel,
    });
  }
  for (const item of data.assessmentHistory) {
    push({
      assessmentId: item.assessmentId,
      completedAt: item.completedAt,
      scorePercentage: item.scorePercentage,
      scoreBand: item.scoreBand,
      bandLabel: item.bandLabel,
    });
  }

  return rows.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

function HistoryCard({ row }: { row: HistoryRow }) {
  const band: ScoreBandKey = row.scoreBand ?? bandFromPercentage(row.scorePercentage);

  return (
    <article className="app-card app-card-interactive p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="inline-flex items-center gap-1.5 font-heading text-base font-semibold text-[var(--text-primary)]">
          <CalendarDays className="size-4 text-[var(--text-muted)]" aria-hidden="true" />
          {formatDate(row.completedAt)}
        </p>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="font-heading text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {row.scorePercentage}%
          </span>
          <BandBadge band={band} label={row.bandLabel} size="sm" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.historyDetail(row.assessmentId)}>
            View my answers
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function HistoryContainer() {
  const query = useDashboard();
  const rows = useMemo(
    () => (query.data ? toRows(query.data) : []),
    [query.data],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My health history"
        description="Every completed assessment, with your scores and answers."
      />

      {query.isLoading ? (
        <LoadingState label="Loading your history…" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <div className="app-card p-8">
          <EmptyState
            icon={ClipboardPlus}
            title="No completed assessments yet"
            description="Complete your first health assessment to start tracking your family's health journey."
            action={
              <Button asChild>
                <Link href={ROUTES.welcome}>
                  Start assessment
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <HistoryCard key={row.assessmentId} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

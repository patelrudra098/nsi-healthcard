"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { AdminHabitPlanSummary, HabitPlanStatus } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableCellText,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableLoadingRows,
  TablePagination,
  TableRow,
} from "@/shared/ui/table";
import { ErrorState, PageHeader } from "@/shared/components";
import { useAdminHabitPlans } from "../hooks";
import type { AdminHabitPlansQuery } from "../types";

const PAGE_SIZE = 20;
const ALL = "ALL";

const STATUS_META: Record<
  HabitPlanStatus,
  { label: string; variant: "success" | "info" | "soft" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  COMPLETED: { label: "Completed", variant: "info" },
  ABANDONED: { label: "Abandoned", variant: "soft" },
};

const STATUS_OPTIONS: HabitPlanStatus[] = ["ACTIVE", "COMPLETED", "ABANDONED"];

function ProgressCell({ percent }: { percent: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--muted)]">
        <span
          className="block h-full rounded-full bg-[var(--primary)]"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="tabular-nums text-[var(--text-secondary)]">{pct}%</span>
    </span>
  );
}

export function AdminHabitPlansContainer() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminHabitPlansQuery["status"]>("");

  const query = useAdminHabitPlans({ page, limit: PAGE_SIZE, status });
  const plans = query.data?.habitPlans ?? [];
  const pagination = query.data?.pagination;

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habit plans"
        description="Every 21-day habit challenge across the platform, with progress and check-in activity."
      />

      <div className="flex flex-wrap gap-3">
        <Select
          value={status || ALL}
          onValueChange={(value) => {
            setStatus(value === ALL ? "" : (value as AdminHabitPlansQuery["status"]));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_META[option].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table isLoading={query.isFetching && !query.isPlaceholderData}>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Habits</TableHead>
            <TableHead>Check-ins</TableHead>
            <TableHead>Last active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading ? (
            <TableLoadingRows rows={8} columns={6} />
          ) : plans.length === 0 ? (
            <TableEmptyState
              colSpan={6}
              icon={<Sparkles className="size-7 text-[var(--text-disabled)]" />}
              title="No habit plans found"
              description="Plans appear here once users complete an assessment."
            />
          ) : (
            plans.map((plan: AdminHabitPlanSummary) => {
              const meta = STATUS_META[plan.status];
              return (
                <TableRow
                  key={plan.id}
                  clickable
                  onClick={() => router.push(ROUTES.adminHabitPlan(plan.id))}
                >
                  <TableCell>
                    <TableCellText
                      primary={plan.user.name}
                      secondary={`+91 ${plan.user.mobile}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.variant} size="sm">
                      {meta.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ProgressCell percent={plan.progressPercent} />
                  </TableCell>
                  <TableCell>
                    <span className="text-[var(--text-secondary)]">
                      {plan.sectionKeys.length > 0
                        ? plan.sectionKeys.join(", ")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="tabular-nums text-[var(--text-secondary)]">
                      {plan.checkInsCompleted}/{plan.totalWeeks} weeks
                    </span>
                  </TableCell>
                  <TableCell>
                    {plan.lastActiveAt ? formatDate(plan.lastActiveAt) : "—"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

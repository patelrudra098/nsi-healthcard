"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Eye, Trash2 } from "lucide-react";
import { BAND_META, ROUTES, type ScoreBandKey } from "@/config/constants";
import type { AdminAssessmentSummary } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { notifySuccess } from "@/lib/notify";
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
  TableActionButton,
  TableBody,
  TableCell,
  TableCellActions,
  TableCellText,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableLoadingRows,
  TablePagination,
  TableRow,
} from "@/shared/ui/table";
import {
  BandBadge,
  ConfirmDialog,
  ErrorState,
  PageHeader,
} from "@/shared/components";
import { useAdminAssessments, useDeleteAssessment } from "../hooks";
import type { AdminAssessmentsQuery } from "../types";

const PAGE_SIZE = 20;
const ALL = "ALL";

const BAND_KEYS: ScoreBandKey[] = [
  "VERY_STRONG",
  "GOOD",
  "MODERATE",
  "WEAK",
  "HIGH_RISK",
];

export function AdminAssessmentsContainer() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [scoreBand, setScoreBand] = useState<AdminAssessmentsQuery["scoreBand"]>("");
  const [status, setStatus] = useState<AdminAssessmentsQuery["status"]>("");
  const [deleteTarget, setDeleteTarget] = useState<AdminAssessmentSummary | null>(
    null,
  );

  const query = useAdminAssessments({ page, limit: PAGE_SIZE, scoreBand, status });
  const deleteAssessment = useDeleteAssessment();

  const assessments = query.data?.assessments ?? [];
  const pagination = query.data?.pagination;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteAssessment.mutate(deleteTarget.assessmentId, {
      onSuccess: () => {
        notifySuccess("Assessment deleted");
        setDeleteTarget(null);
      },
    });
  };

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Every assessment across the platform, filterable by band and status."
      />

      <div className="flex flex-wrap gap-3">
        <Select
          value={scoreBand || ALL}
          onValueChange={(value) => {
            setScoreBand(value === ALL ? "" : (value as ScoreBandKey));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All bands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All bands</SelectItem>
            {BAND_KEYS.map((band) => (
              <SelectItem key={band} value={band}>
                {BAND_META[band].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status || ALL}
          onValueChange={(value) => {
            setStatus(value === ALL ? "" : (value as AdminAssessmentsQuery["status"]));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table isLoading={query.isFetching && !query.isPlaceholderData}>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead align="right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading ? (
            <TableLoadingRows rows={8} columns={5} />
          ) : assessments.length === 0 ? (
            <TableEmptyState
              colSpan={5}
              icon={<ClipboardList className="size-7 text-[var(--text-disabled)]" />}
              title="No assessments found"
              description="Adjust the filters to see more results."
            />
          ) : (
            assessments.map((assessment) => {
              const completed = assessment.status === "COMPLETED";
              return (
                <TableRow
                  key={assessment.assessmentId}
                  clickable
                  onClick={() =>
                    router.push(ROUTES.adminAssessment(assessment.assessmentId))
                  }
                >
                  <TableCell>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(ROUTES.adminUser(assessment.user.id));
                      }}
                      className="text-left outline-none hover:underline focus-visible:underline"
                    >
                      <TableCellText
                        primary={assessment.user.name}
                        secondary={`+91 ${assessment.user.mobile}`}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={completed ? "success" : "warning"} size="sm">
                      {completed ? "Completed" : "In progress"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {completed ? (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                          {assessment.scorePercentage}%
                        </span>
                        <BandBadge
                          band={assessment.scoreBand as ScoreBandKey}
                          size="sm"
                        />
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {assessment.completedAt
                      ? formatDate(assessment.completedAt)
                      : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <TableCellActions>
                      <TableActionButton
                        icon={<Eye />}
                        label="View assessment"
                        onClick={() =>
                          router.push(ROUTES.adminAssessment(assessment.assessmentId))
                        }
                      />
                      <TableActionButton
                        icon={<Trash2 />}
                        label="Delete assessment"
                        variant="destructive"
                        onClick={() => setDeleteTarget(assessment)}
                      />
                    </TableCellActions>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete assessment?"
        description={
          deleteTarget
            ? `This permanently removes ${deleteTarget.user.name}'s assessment. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete assessment"
        destructive
        loading={deleteAssessment.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

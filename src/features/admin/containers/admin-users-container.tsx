"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Users } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { AdminUserSummary, ScoreBandKey } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { notifySuccess } from "@/lib/notify";
import { Badge } from "@/shared/ui/badge";
import { SearchInput } from "@/shared/ui/searchinput";
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
import { BandBadge, ErrorState, PageHeader } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components";
import { useAdminUsers, useDeleteUser } from "../hooks";

const PAGE_SIZE = 20;

export function AdminUsersContainer() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUserSummary | null>(null);

  const query = useAdminUsers({ page, limit: PAGE_SIZE, search });
  const deleteUser = useDeleteUser();

  const users = query.data?.users ?? [];
  const pagination = query.data?.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifySuccess("User deleted");
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
        title="Users"
        description="Search, view, and manage every registered member."
      />

      <SearchInput
        onSearch={handleSearch}
        isLoading={query.isFetching}
        placeholder="Search by name or mobile…"
        wrapperClassName="max-w-md"
      />

      <Table isLoading={query.isFetching && !query.isPlaceholderData}>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Latest score</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead align="right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading ? (
            <TableLoadingRows rows={8} columns={5} />
          ) : users.length === 0 ? (
            <TableEmptyState
              colSpan={5}
              icon={<Users className="size-7 text-[var(--text-disabled)]" />}
              title="No users found"
              description={
                search
                  ? "Try a different name or mobile number."
                  : "Members will appear here once they register."
              }
            />
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                clickable
                onClick={() => router.push(ROUTES.adminUser(user.id))}
              >
                <TableCell>
                  <TableCellText primary={user.name} secondary={`+91 ${user.mobile}`} />
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "soft"} size="sm">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.latestAssessment ? (
                    <span className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                        {user.latestAssessment.scorePercentage}%
                      </span>
                      <BandBadge
                        band={user.latestAssessment.scoreBand as ScoreBandKey}
                        size="sm"
                      />
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">Not taken</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell align="right">
                  <TableCellActions>
                    <TableActionButton
                      icon={<Eye />}
                      label="View user"
                      onClick={() => router.push(ROUTES.adminUser(user.id))}
                    />
                    <TableActionButton
                      icon={<Trash2 />}
                      label="Delete user"
                      variant="destructive"
                      onClick={() => setDeleteTarget(user)}
                    />
                  </TableCellActions>
                </TableCell>
              </TableRow>
            ))
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
        title="Delete user?"
        description={
          deleteTarget
            ? `This permanently removes ${deleteTarget.name} and all of their assessments. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete user"
        destructive
        loading={deleteUser.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

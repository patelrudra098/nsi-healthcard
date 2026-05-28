"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown, Save } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { AssessmentResult, ScoreBandKey } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { normalizeError } from "@/lib/error";
import { notifySuccess } from "@/lib/notify";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  BandBadge,
  ErrorState,
  LoadingState,
  PageHeader,
  PlanSummary,
  SectionBreakdown,
} from "@/shared/components";
import { useAdminUser, useUpdateUser } from "../hooks";
import { adminUserSchema, type AdminUserInput } from "../types";

function AssessmentHistoryItem({ assessment }: { assessment: AssessmentResult }) {
  return (
    <Collapsible className="rounded-[var(--radius-md)] border border-[var(--border)]">
      <CollapsibleTrigger className="group/trigger rounded-[var(--radius-md)]">
        <span className="flex flex-1 items-center gap-3">
          <span className="font-heading text-base font-bold tabular-nums text-[var(--text-primary)]">
            {assessment.scorePercentage}%
          </span>
          <BandBadge band={assessment.scoreBand as ScoreBandKey} label={assessment.bandLabel} size="sm" />
          <span className="text-xs text-[var(--text-muted)]">
            {formatDate(assessment.completedAt)}
          </span>
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-5 pt-1">
          {assessment.weakestSection && (
            <p className="text-sm text-[var(--text-secondary)]">
              Weakest area:{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {assessment.weakestSection.label} ({assessment.weakestSection.sectionPercent}%)
              </span>
            </p>
          )}
          <SectionBreakdown
            sections={assessment.sectionScores}
            weakestKey={assessment.weakestSection?.sectionKey}
          />
          {assessment.improvementPlan && (
            <div className="border-t border-[var(--border)] pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Improvement plan
              </p>
              <PlanSummary plan={assessment.improvementPlan} />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AdminUserDetailContainer() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const query = useAdminUser(id);
  const updateUser = useUpdateUser(id);

  const form = useForm<AdminUserInput>({
    resolver: zodResolver(adminUserSchema),
    values: query.data
      ? {
          name: query.data.name,
          mobile: query.data.mobile,
          role: query.data.role,
        }
      : undefined,
  });

  const onSubmit = async (values: AdminUserInput) => {
    try {
      await updateUser.mutateAsync(values);
      notifySuccess("User updated");
    } catch (error) {
      const normalized = normalizeError(error);
      if (normalized.status === 409) {
        form.setError("mobile", { message: "Mobile already in use" });
      } else {
        form.setError("mobile", { message: normalized.message });
      }
    }
  };

  if (query.isLoading) return <LoadingState label="Loading user…" />;
  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }
  if (!query.data) return <ErrorState title="User not found" />;

  const user = query.data;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={ROUTES.adminUsers}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            All users
          </Link>
        </Button>
        <PageHeader
          title={user.name}
          description={`+91 ${user.mobile} · Registered ${formatDate(user.createdAt)}`}
        />
      </div>

      <section className="app-card space-y-5 p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Edit profile
        </h2>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
            <Input
              label="Mobile number"
              inputMode="numeric"
              {...form.register("mobile")}
              error={form.formState.errors.mobile?.message}
            />
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Role
              </label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={updateUser.isPending}
              disabled={!form.formState.isDirty}
            >
              <Save className="size-4" aria-hidden="true" />
              Save changes
            </Button>
          </div>
        </form>
      </section>

      <section className="app-card space-y-4 p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Assessment history
          <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
            ({user.assessments.length})
          </span>
        </h2>
        {user.assessments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            This user hasn&apos;t completed any assessments yet.
          </p>
        ) : (
          <div className="space-y-3">
            {user.assessments.map((assessment) => (
              <AssessmentHistoryItem
                key={assessment.assessmentId}
                assessment={assessment}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

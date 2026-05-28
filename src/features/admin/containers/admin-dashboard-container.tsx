"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Gauge,
  CheckCircle2,
  Users,
} from "lucide-react";
import { ROUTES } from "@/config/constants";
import { Button } from "@/shared/ui/button";
import {
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
} from "@/shared/components";
import { useAdminStats } from "../hooks";
import { BandDistribution } from "../components/band-distribution";

export function AdminDashboardContainer() {
  const stats = useAdminStats();

  if (stats.isLoading) return <LoadingState label="Loading platform stats…" />;
  if (stats.isError) {
    return <ErrorState error={stats.error} onRetry={() => stats.refetch()} />;
  }
  if (!stats.data) return <ErrorState />;

  const data = stats.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="A live snapshot of users, assessments, and overall health scores."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={data.totalUsers.toLocaleString()}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Total assessments"
          value={data.totalAssessments.toLocaleString()}
          icon={ClipboardList}
          accent="violet"
        />
        <StatCard
          label="Completed"
          value={data.completedAssessments.toLocaleString()}
          hint={`${data.completionRate}% completion rate`}
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="Average score"
          value={`${data.averageScorePercentage}%`}
          icon={Gauge}
          accent="amber"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="app-card space-y-5 p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Score band distribution
          </h2>
          <BandDistribution
            distribution={data.bandDistribution}
            completed={data.completedAssessments}
          />
        </section>

        <section className="app-card flex flex-col gap-3 p-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Manage
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Browse and manage members and their assessments.
          </p>
          <div className="mt-auto flex flex-col gap-2">
            <Button variant="outline" className="justify-between" asChild>
              <Link href={ROUTES.adminUsers}>
                View all users
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link href={ROUTES.adminAssessments}>
                View all assessments
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

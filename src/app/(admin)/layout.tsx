"use client";

import { ClipboardList, LayoutDashboard, Sparkles, Users } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { AdminRoute, useAuth, useLogout } from "@/features/auth";
import { AppShell, type NavItem } from "@/shared/layout";

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: ROUTES.admin, icon: LayoutDashboard, exact: true },
  { label: "Users", href: ROUTES.adminUsers, icon: Users },
  { label: "Assessments", href: ROUTES.adminAssessments, icon: ClipboardList },
  { label: "Habit plans", href: ROUTES.adminHabitPlans, icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <AdminRoute>
      <AppShell
        navItems={NAV_ITEMS}
        user={user}
        homeHref={ROUTES.admin}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      >
        {children}
      </AppShell>
    </AdminRoute>
  );
}

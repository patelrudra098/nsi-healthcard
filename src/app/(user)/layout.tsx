"use client";

import { ClipboardPlus, LayoutDashboard } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { ProtectedRoute, useAuth, useLogout } from "@/features/auth";
import { AppShell, type NavItem } from "@/shared/layout";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard, exact: true },
  { label: "New assessment", href: ROUTES.welcome, icon: ClipboardPlus },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <ProtectedRoute>
      <AppShell
        navItems={NAV_ITEMS}
        user={user}
        homeHref={ROUTES.dashboard}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      >
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}

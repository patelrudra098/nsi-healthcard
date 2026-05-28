"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/constants";
import { ROLES } from "@/config/rbac";
import { FullPageLoader } from "@/shared/ui/spinner";
import { useAuth } from "../hooks";

/** Any authenticated user. Redirects to /login otherwise. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace(ROUTES.login);
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) return <FullPageLoader />;
  if (!isAuthenticated) return <FullPageLoader />;
  return <>{children}</>;
}

/** ADMIN only. Non-admins go to their dashboard; guests to login. */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) router.replace(ROUTES.login);
    else if (user?.role !== ROLES.ADMIN) router.replace(ROUTES.dashboard);
  }, [isHydrated, isAuthenticated, user?.role, router]);

  if (!isHydrated) return <FullPageLoader />;
  if (!isAuthenticated || user?.role !== ROLES.ADMIN) {
    return <FullPageLoader />;
  }
  return <>{children}</>;
}

/** Only for guests. Authenticated users go to their home surface. */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    router.replace(user?.role === ROLES.ADMIN ? ROUTES.admin : ROUTES.dashboard);
  }, [isHydrated, isAuthenticated, user?.role, router]);

  if (!isHydrated) return <FullPageLoader />;
  if (isAuthenticated) return <FullPageLoader />;
  return <>{children}</>;
}

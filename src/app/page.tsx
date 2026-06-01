"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/constants";
import { ROLES } from "@/config/rbac";
import { useAuth } from "@/features/auth";
import { FullPageLoader } from "@/shared/ui/spinner";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }
    router.replace(user?.role === ROLES.ADMIN ? ROUTES.admin : ROUTES.dashboard);
  }, [isHydrated, isAuthenticated, user?.role, router]);

  return <FullPageLoader label="Loading HealthCard…" />;
}

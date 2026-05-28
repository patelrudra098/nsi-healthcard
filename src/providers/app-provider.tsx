"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/config/constants";
import { setUnauthorizedHandler } from "@/services";
import { useAuthStore } from "@/features/auth";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { RbacProvider } from "./rbac-provider";

function AuthInit() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuthStore((s) => s.hydrate);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      if (!pathname.startsWith(ROUTES.login)) {
        router.replace(ROUTES.login);
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, router, pathname]);

  return null;
}

function RbacBridge({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return (
    <RbacProvider user={user ? { roles: [user.role] } : undefined}>
      {children}
    </RbacProvider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthInit />
        <RbacBridge>{children}</RbacBridge>
      </QueryProvider>
    </ThemeProvider>
  );
}

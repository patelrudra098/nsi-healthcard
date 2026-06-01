"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import type { NavItem, ShellUser } from "./types";

const COLLAPSE_KEY = "nsi_sidebar_collapsed";

interface AppShellProps {
  navItems: NavItem[];
  user: ShellUser | null;
  homeHref: string;
  heading?: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
  children: React.ReactNode;
}

/** Authenticated app frame: collapsible desktop sidebar + mobile drawer + navbar. */
export function AppShell({
  navItems,
  user,
  homeHref,
  heading,
  onLogout,
  isLoggingOut,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage post-mount to avoid SSR/CSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  useEffect(() => {
    // Close the mobile drawer whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      <Sidebar
        navItems={navItems}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        navItems={navItems}
        homeHref={homeHref}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          heading={heading}
          user={user}
          homeHref={homeHref}
          onOpenMobile={() => setMobileOpen(true)}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
        <main
          key={pathname}
          className="app-page-enter flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

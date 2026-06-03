"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import type { NavItem, ShellUser } from "./types";

interface AppShellProps {
  navItems: NavItem[];
  user: ShellUser | null;
  homeHref: string;
  heading?: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
  children: React.ReactNode;
}

/**
 * Authenticated app frame: a desktop icon rail that expands into an overlay
 * panel (content never shifts), plus a hamburger-triggered drawer on mobile.
 */
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
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    // Close both overlays whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavOpen(false);
    setSidebarExpanded(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      <MobileNav
        open={navOpen}
        onOpenChange={setNavOpen}
        navItems={navItems}
        homeHref={homeHref}
      />

      <Sidebar
        navItems={navItems}
        homeHref={homeHref}
        expanded={sidebarExpanded}
        onOpen={() => setSidebarExpanded(true)}
        onClose={() => setSidebarExpanded(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          heading={heading}
          user={user}
          homeHref={homeHref}
          onOpenMobile={() => setNavOpen(true)}
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

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
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

/** Authenticated app frame: navbar + hamburger-triggered overlay nav drawer. */
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

  useEffect(() => {
    // Close the nav drawer whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      <MobileNav
        open={navOpen}
        onOpenChange={setNavOpen}
        navItems={navItems}
        homeHref={homeHref}
      />

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
  );
}

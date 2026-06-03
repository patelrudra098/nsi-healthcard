"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { Logo } from "@/shared/components/logo";
import { Avatar } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ShellUser } from "./types";

interface NavbarProps {
  heading?: string;
  user: ShellUser | null;
  homeHref: string;
  onOpenMobile: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

/** Sticky top bar: mobile hamburger, brand logo, page heading, and the user menu. */
export function Navbar({
  heading,
  user,
  homeHref,
  onOpenMobile,
  onLogout,
  isLoggingOut,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open navigation menu"
        className="inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--muted)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <Link
        href={homeHref}
        aria-label="HealthCard home"
        className="rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        <Logo />
      </Link>

      {heading && (
        <>
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-[var(--border)] md:block"
          />
          <h2 className="hidden truncate font-heading text-base font-semibold text-[var(--text-primary)] md:block">
            {heading}
          </h2>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 outline-none sm:pr-3",
                "transition-colors hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              )}
            >
              <Avatar size="sm" fallback={getInitials(user.name)} />
              <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
                <span className="max-w-[12rem] truncate text-sm font-semibold text-[var(--text-primary)]">
                  {user.name}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {user.role === "ADMIN" ? "Administrator" : "Member"}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <span className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {user.name}
                  </span>
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    +91 {user.mobile}
                  </span>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  if (!isLoggingOut) onLogout();
                }}
              >
                <LogOut className="size-4" aria-hidden="true" />
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

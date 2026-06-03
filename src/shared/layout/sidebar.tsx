"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/shared/components/logo";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import type { NavItem } from "./types";

const iconButton = cn(
  "inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] outline-none",
  "text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--muted)] hover:text-[var(--text-primary)]",
  "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none",
);

interface SidebarProps {
  navItems: NavItem[];
  homeHref: string;
  expanded: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Desktop sidebar (lg and up). A persistent icon rail stays in place; opening
 * slides a full panel *over* the content (a fixed spacer reserves the rail
 * width so the page never shifts). The panel is laid out at its final width and
 * only translates, so nothing reflows — the motion stays smooth.
 */
export function Sidebar({
  navItems,
  homeHref,
  expanded,
  onOpen,
  onClose,
}: SidebarProps) {
  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, onClose]);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Spacer — reserves the rail width so content never shifts. */}
      <div className="hidden w-[4.75rem] shrink-0 lg:block" aria-hidden="true" />

      {/* Persistent icon rail. */}
      <aside
        inert={expanded || undefined}
        className="fixed left-0 top-0 z-30 hidden h-dvh w-[4.75rem] flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex"
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-[var(--border)]">
          <button
            type="button"
            onClick={onOpen}
            aria-label="Expand sidebar"
            aria-expanded={false}
            className={iconButton}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed />
          ))}
        </nav>
      </aside>

      {/* Scrim behind the expanded panel; click to close. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 hidden bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:block",
          expanded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Expanded panel — laid out at full width, slides in over the content. */}
      <aside
        inert={!expanded || undefined}
        className={cn(
          "fixed left-0 top-0 z-50 hidden h-dvh w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] lg:flex",
          "transition-transform duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          expanded ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
          <Link
            href={homeHref}
            aria-label="HealthCard home"
            className="rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Collapse sidebar"
            className={iconButton}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={onClose} />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}

"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/shared/components/logo";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import type { NavItem } from "./types";

interface SidebarProps {
  navItems: NavItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  homeHref: string;
}

/** Desktop sidebar: sticky, collapsible to an icon rail. Hidden below lg. */
export function Sidebar({
  navItems,
  collapsed,
  onToggleCollapse,
  homeHref,
}: SidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex",
          "transition-[width] duration-200 [transition-timing-function:cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-[var(--border)]",
            collapsed ? "justify-center px-2" : "px-5",
          )}
        >
          <Link
            href={homeHref}
            className="rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            aria-label="NSI Health home"
          >
            <Logo showText={!collapsed} />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] outline-none",
              "transition-colors duration-150 hover:bg-[var(--muted)] hover:text-[var(--text-primary)]",
              "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-[18px] shrink-0" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="size-[18px] shrink-0" aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

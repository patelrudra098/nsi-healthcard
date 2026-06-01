"use client";

import { Menu } from "lucide-react";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import type { NavItem } from "./types";

interface SidebarProps {
  navItems: NavItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/** Desktop sidebar: hamburger toggle on top, then the nav rail. Hidden below lg. */
export function Sidebar({ navItems, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex",
          "transition-[width] duration-200 [transition-timing-function:cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-[var(--border)] px-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={!collapsed}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] outline-none",
              "transition-colors duration-150 hover:bg-[var(--muted)] hover:text-[var(--text-primary)]",
              "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
            )}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}

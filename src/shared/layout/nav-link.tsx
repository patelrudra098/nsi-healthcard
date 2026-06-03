"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem } from "./types";

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

interface NavLinkProps {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Sidebar navigation link with active state and collapsed-mode tooltip. */
export function NavLink({ item, collapsed = false, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active = isNavItemActive(item, pathname);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-[var(--radius-md)] text-sm font-medium outline-none",
        "transition-colors duration-150 [transition-timing-function:cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        collapsed ? "mx-auto size-11 justify-center" : "gap-3 px-3 py-2.5",
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--muted)] hover:text-[var(--text-primary)]",
      )}
    >
      {active && !collapsed && (
        <span
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--primary)]"
          aria-hidden="true"
        />
      )}
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

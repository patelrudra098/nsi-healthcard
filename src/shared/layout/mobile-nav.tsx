"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { X } from "lucide-react";
import { Logo } from "@/shared/components/logo";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import type { NavItem } from "./types";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: NavItem[];
  homeHref: string;
}

/** Mobile slide-in drawer (Radix dialog: focus trap + ESC + scroll lock). */
export function MobileNav({
  open,
  onOpenChange,
  navItems,
  homeHref,
}: MobileNavProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "motion-reduce:animate-none",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col bg-[var(--surface)] shadow-[var(--shadow-lg)] outline-none",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:duration-300",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=closed]:duration-200",
            "data-[state=open]:[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]",
            "motion-reduce:animate-none",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Navigation menu
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Primary navigation links
          </DialogPrimitive.Description>

          <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
            <Link
              href={homeHref}
              onClick={() => onOpenChange(false)}
              aria-label="HealthCard home"
              className="rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <Logo />
            </Link>
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] outline-none transition-colors hover:bg-[var(--muted)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                onNavigate={() => onOpenChange(false)}
              />
            ))}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

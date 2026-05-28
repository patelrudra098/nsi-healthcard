import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When true, only the exact path is active (not nested routes). */
  exact?: boolean;
}

export interface ShellUser {
  name: string;
  mobile: string;
  role: string;
}

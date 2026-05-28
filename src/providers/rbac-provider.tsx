"use client";

import { createContext, useMemo } from "react";
import {
  checkPermission,
  hasRole as hasRoleFn,
  resolvePermissions,
  type Permission,
  type RbacUser,
  type Role,
} from "@/lib/rbac";

export interface RbacContextValue {
  roles: Role[];
  permissions: Permission[];
  hasRole: (required: Role | Role[]) => boolean;
  can: (required: Permission | Permission[]) => boolean;
}

export const RbacContext = createContext<RbacContextValue | null>(null);

interface RbacProviderProps {
  children: React.ReactNode;
  /** Current user's roles/permissions. Wire this to auth once available. */
  user?: RbacUser;
}

export function RbacProvider({ children, user }: RbacProviderProps) {
  const value = useMemo<RbacContextValue>(() => {
    const current: RbacUser = user ?? { roles: [] };
    return {
      roles: current.roles,
      permissions: [...resolvePermissions(current)],
      hasRole: (required) => hasRoleFn(current.roles, required),
      can: (required) => checkPermission(current, required),
    };
  }, [user]);

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

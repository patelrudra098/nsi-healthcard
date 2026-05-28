import type { ROLES, PERMISSIONS } from "@/config/rbac";

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface RbacUser {
  roles: Role[];
  /** Explicit permissions. When omitted, permissions are derived from roles. */
  permissions?: Permission[];
}

import { ROLE_PERMISSIONS } from "@/config/rbac";
import type { Permission, RbacUser } from "./types";

/** Resolve the full set of permissions a user has, from explicit perms + roles. */
export function resolvePermissions(user: RbacUser): Set<Permission> {
  const fromRoles = user.roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []);
  return new Set<Permission>([...fromRoles, ...(user.permissions ?? [])]);
}

export function checkPermission(
  user: RbacUser,
  required: Permission | Permission[],
): boolean {
  const list = Array.isArray(required) ? required : [required];
  if (list.length === 0) return true;
  const granted = resolvePermissions(user);
  return list.every((permission) => granted.has(permission));
}

export function checkAnyPermission(
  user: RbacUser,
  required: Permission[],
): boolean {
  if (required.length === 0) return true;
  const granted = resolvePermissions(user);
  return required.some((permission) => granted.has(permission));
}

import type { Role } from "./types";

export function hasRole(
  userRoles: Role[],
  required: Role | Role[],
): boolean {
  const list = Array.isArray(required) ? required : [required];
  return list.some((role) => userRoles.includes(role));
}

export function hasAllRoles(userRoles: Role[], required: Role[]): boolean {
  return required.every((role) => userRoles.includes(role));
}

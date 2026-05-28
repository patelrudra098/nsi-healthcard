// Role & permission constants for the NSI Family Health Scorecard.

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const PERMISSIONS = {
  ASSESSMENT_TAKE: "assessment:take",
  DASHBOARD_VIEW: "dashboard:view",
  ADMIN_PANEL_VIEW: "admin:view",
  ADMIN_USERS_MANAGE: "admin:users:manage",
  ADMIN_ASSESSMENTS_MANAGE: "admin:assessments:manage",
} as const;

type RoleValue = (typeof ROLES)[keyof typeof ROLES];
type PermissionValue = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<RoleValue, PermissionValue[]> = {
  [ROLES.USER]: [PERMISSIONS.ASSESSMENT_TAKE, PERMISSIONS.DASHBOARD_VIEW],
  [ROLES.ADMIN]: [
    PERMISSIONS.ADMIN_PANEL_VIEW,
    PERMISSIONS.ADMIN_USERS_MANAGE,
    PERMISSIONS.ADMIN_ASSESSMENTS_MANAGE,
  ],
};

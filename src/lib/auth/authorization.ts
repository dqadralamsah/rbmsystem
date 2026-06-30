import type { CurrentUser } from "@/types/auth";
import { AuthRole } from "@/types/auth";

export function hasPermissionCode(
  userPermissions: readonly string[],
  permission: string | readonly string[],
): boolean {
  const requiredPermissions = Array.isArray(permission)
    ? permission
    : [permission];

  return requiredPermissions.some((permissionCode) =>
    userPermissions.includes(permissionCode),
  );
}

export function hasRole(
  user: CurrentUser,
  role: AuthRole | readonly AuthRole[],
): boolean {
  const allowedRoles = Array.isArray(role) ? role : [role];

  return allowedRoles.includes(user.role as AuthRole);
}

export function isAdmin(user: CurrentUser): boolean {
  return hasRole(user, AuthRole.ADMIN);
}

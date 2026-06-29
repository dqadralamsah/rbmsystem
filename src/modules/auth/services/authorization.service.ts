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

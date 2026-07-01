import "server-only";

import {
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import * as rolePermissionRepository from "@/modules/master-data/role-permissions/repositories/role-permission.repository";
import type { UpdateRolePermissionsInput } from "@/modules/master-data/role-permissions/types";
import type { CurrentUser } from "@/types/auth";
import { AuthRole } from "@/types/auth";

export async function getRolePermissionMatrix(roleId: string) {
  const matrix = await rolePermissionRepository.findRolePermissionMatrix(roleId);

  if (!matrix.role) {
    throw new NotFoundError("Role was not found.");
  }

  const assignedPermissionIds = new Set(
    matrix.role.permissions.map((rolePermission) => rolePermission.permissionId),
  );

  return {
    role: matrix.role,
    permissions: matrix.permissions.map((permission) => ({
      ...permission,
      assigned: assignedPermissionIds.has(permission.id),
    })),
  };
}

export async function updateRolePermissions(
  roleId: string,
  input: UpdateRolePermissionsInput,
  user: CurrentUser,
) {
  if (user.role !== AuthRole.ADMIN) {
    throw new ValidationError("Only Super Admin can update role permissions.");
  }

  const matrix = await getRolePermissionMatrix(roleId);

  if (matrix.role.name === AuthRole.ADMIN) {
    throw new ValidationError("Super Admin permissions cannot be changed.");
  }

  const uniquePermissionIds = [...new Set(input.permissionIds)];
  const permissionCount =
    await rolePermissionRepository.countPermissionsByIds(uniquePermissionIds);

  if (permissionCount !== uniquePermissionIds.length) {
    throw new ValidationError("One or more permissions are invalid.");
  }

  const updatedRole = await rolePermissionRepository.replaceRolePermissions(
    roleId,
    uniquePermissionIds,
  );

  if (!updatedRole) {
    throw new NotFoundError("Role was not found.");
  }

  return updatedRole;
}

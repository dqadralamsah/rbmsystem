import type { NextRequest } from "next/server";

import {
  apiSuccess,
  validateRequestBody,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
import {
  getRolePermissionMatrix,
  updateRolePermissions,
  updateRolePermissionsSchema,
} from "@/modules/master-data/role-permissions";

interface RolePermissionRouteContext {
  params: Promise<{
    roleId: string;
  }>;
}

export const GET = withApiPermission<RolePermissionRouteContext>(
  "master.role",
  async (_request: NextRequest, context) => {
    const { roleId } = await context.params;
    const matrix = await getRolePermissionMatrix(roleId);

    return apiSuccess(matrix);
  },
);

export const PUT = withApiPermission<RolePermissionRouteContext>(
  "master.role",
  async (request: NextRequest, context) => {
    const { roleId } = await context.params;
    const payload = await validateRequestBody(
      request,
      updateRolePermissionsSchema,
    );
    const oldMatrix = await getRolePermissionMatrix(roleId);
    const role = await updateRolePermissions(roleId, payload, context.user);
    const newMatrix = await getRolePermissionMatrix(roleId);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.UPDATE_PERMISSIONS,
      resource: "RolePermission",
      resourceId: roleId,
      description: "Updated role permissions.",
      oldValues: oldMatrix,
      newValues: newMatrix,
      metadata: {
        roleId: role.id,
        roleName: role.name,
      },
    });

    return apiSuccess(role, { message: "Role permissions updated." });
  },
);

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
  getRole,
  updateRole,
  updateRoleSchema,
} from "@/modules/master-data/roles";

const ROLE_PERMISSION = "master.role";

interface RoleRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiPermission<RoleRouteContext>(
  ROLE_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const role = await getRole(id);

    return apiSuccess(role);
  },
);

export const PATCH = withApiPermission<RoleRouteContext>(
  ROLE_PERMISSION,
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, updateRoleSchema);
    const oldRole = await getRole(id);
    const role = await updateRole(id, payload);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.UPDATE,
      resource: "Role",
      resourceId: role.id,
      description: "Updated role.",
      oldValues: oldRole,
      newValues: role,
    });

    return apiSuccess(role, { message: "Role updated." });
  },
);

import type { NextRequest } from "next/server";

import {
  apiCreated,
  apiPaginated,
  parsePagination,
  validateRequestBody,
  validateSearchParams,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
import {
  createRole,
  createRoleSchema,
  listRoles,
  roleListQuerySchema,
} from "@/modules/master-data/roles";

const ROLE_PERMISSION = "master.role";

export const GET = withApiPermission(
  ROLE_PERMISSION,
  async (request: NextRequest) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      roleListQuerySchema,
    );
    const result = await listRoles({
      search: query.search,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

export const POST = withApiPermission(
  ROLE_PERMISSION,
  async (request: NextRequest, context) => {
    const payload = await validateRequestBody(request, createRoleSchema);
    const role = await createRole(payload);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.CREATE,
      resource: "Role",
      resourceId: role.id,
      description: "Created role.",
      newValues: role,
    });

    return apiCreated(role, "Role created.");
  },
);

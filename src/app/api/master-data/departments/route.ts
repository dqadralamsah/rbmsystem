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
  createDepartment,
  createDepartmentSchema,
  departmentListQuerySchema,
  listDepartments,
} from "@/modules/master-data/departments";

const DEPARTMENT_PERMISSION = "master.department";

export const GET = withApiPermission(
  DEPARTMENT_PERMISSION,
  async (request: NextRequest) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      departmentListQuerySchema,
    );
    const result = await listDepartments({
      search: query.search,
      status: query.status,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

export const POST = withApiPermission(
  DEPARTMENT_PERMISSION,
  async (request: NextRequest, context) => {
    const payload = await validateRequestBody(request, createDepartmentSchema);
    const department = await createDepartment(payload);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.CREATE,
      resource: "Department",
      resourceId: department.id,
      description: "Created department.",
      newValues: department,
    });

    return apiCreated(department, "Department created.");
  },
);

import type { NextRequest } from "next/server";

import {
  apiNoContent,
  apiSuccess,
  validateRequestBody,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
import {
  deleteDepartment,
  getDepartment,
  updateDepartment,
  updateDepartmentSchema,
} from "@/modules/master-data/departments";

const DEPARTMENT_PERMISSION = "master.department";

interface DepartmentRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiPermission<DepartmentRouteContext>(
  DEPARTMENT_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const department = await getDepartment(id);

    return apiSuccess(department);
  },
);

export const PATCH = withApiPermission<DepartmentRouteContext>(
  DEPARTMENT_PERMISSION,
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, updateDepartmentSchema);
    const oldDepartment = await getDepartment(id);
    const department = await updateDepartment(id, payload);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.UPDATE,
      resource: "Department",
      resourceId: department.id,
      description: "Updated department.",
      oldValues: oldDepartment,
      newValues: department,
    });

    return apiSuccess(department, { message: "Department updated." });
  },
);

export const DELETE = withApiPermission<DepartmentRouteContext>(
  DEPARTMENT_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const department = await getDepartment(id);

    await deleteDepartment(id);
    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.DELETE,
      resource: "Department",
      resourceId: department.id,
      description: "Deleted department.",
      oldValues: department,
    });

    return apiNoContent();
  },
);

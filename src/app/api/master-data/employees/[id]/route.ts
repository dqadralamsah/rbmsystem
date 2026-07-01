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
  deleteEmployee,
  getEmployee,
  updateEmployee,
  updateEmployeeSchema,
} from "@/modules/master-data/employees";

const EMPLOYEE_PERMISSION = "master.user";

interface EmployeeRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiPermission<EmployeeRouteContext>(
  EMPLOYEE_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const employee = await getEmployee(id);

    return apiSuccess(employee);
  },
);

export const PATCH = withApiPermission<EmployeeRouteContext>(
  EMPLOYEE_PERMISSION,
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, updateEmployeeSchema);
    const oldEmployee = await getEmployee(id);
    const employee = await updateEmployee(id, payload);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.UPDATE,
      resource: "User",
      resourceId: employee.id,
      description: "Updated user.",
      oldValues: oldEmployee,
      newValues: employee,
    });

    return apiSuccess(employee, { message: "Employee updated." });
  },
);

export const DELETE = withApiPermission<EmployeeRouteContext>(
  EMPLOYEE_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const employee = await getEmployee(id);

    await deleteEmployee(id);
    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.DELETE,
      resource: "User",
      resourceId: employee.id,
      description: "Deleted user.",
      oldValues: employee,
    });

    return apiNoContent();
  },
);

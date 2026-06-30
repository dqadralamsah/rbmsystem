import type { NextRequest } from "next/server";

import {
  apiNoContent,
  apiSuccess,
  validateRequestBody,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
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
    const employee = await updateEmployee(id, payload);

    return apiSuccess(employee, { message: "Employee updated." });
  },
);

export const DELETE = withApiPermission<EmployeeRouteContext>(
  EMPLOYEE_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    await deleteEmployee(id);

    return apiNoContent();
  },
);

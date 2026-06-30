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
  createEmployee,
  createEmployeeSchema,
  employeeListQuerySchema,
  listEmployees,
} from "@/modules/master-data/employees";

const EMPLOYEE_PERMISSION = "master.user";

export const GET = withApiPermission(
  EMPLOYEE_PERMISSION,
  async (request: NextRequest) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      employeeListQuerySchema,
    );
    const result = await listEmployees({
      search: query.search,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

export const POST = withApiPermission(
  EMPLOYEE_PERMISSION,
  async (request: NextRequest) => {
    const payload = await validateRequestBody(request, createEmployeeSchema);
    const employee = await createEmployee(payload);

    return apiCreated(employee, "Employee created.");
  },
);

import type { z } from "zod";

import type {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/modules/master-data/employees/validation/employee.validation";
import type { PaginationInput } from "@/types/api";
import type { UserStatus } from "@/generated/prisma/enums";

export interface EmployeeListParams {
  search?: string;
  departmentId?: string;
  roleId?: string;
  status?: UserStatus;
  pagination: PaginationInput;
}

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

import type { z } from "zod";

import type {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/modules/master-data/employees/validation/employee.validation";
import type { PaginationInput } from "@/types/api";

export interface EmployeeListParams {
  search?: string;
  pagination: PaginationInput;
}

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

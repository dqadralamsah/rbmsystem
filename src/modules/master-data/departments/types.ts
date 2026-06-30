import type { z } from "zod";

import type {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "@/modules/master-data/departments/validation/department.validation";
import type { PaginationInput } from "@/types/api";

export interface DepartmentListParams {
  search?: string;
  pagination: PaginationInput;
}

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

import type { z } from "zod";

import type {
  createRoleSchema,
  updateRoleSchema,
} from "@/modules/master-data/roles/validation/role.validation";
import type { PaginationInput } from "@/types/api";

export interface RoleListParams {
  search?: string;
  pagination: PaginationInput;
}

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

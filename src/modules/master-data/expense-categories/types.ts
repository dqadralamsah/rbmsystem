import type { z } from "zod";

import type {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "@/modules/master-data/expense-categories/validation/expense-category.validation";
import type { PaginationInput } from "@/types/api";

export interface ExpenseCategoryListParams {
  search?: string;
  isActive?: boolean;
  status?: "active" | "deleted" | "all";
  pagination: PaginationInput;
}

export type CreateExpenseCategoryInput = z.infer<
  typeof createExpenseCategorySchema
>;
export type UpdateExpenseCategoryInput = z.infer<
  typeof updateExpenseCategorySchema
>;

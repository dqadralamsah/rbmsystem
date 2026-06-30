import type { z } from "zod";

import type { financeActionSchema } from "@/modules/finance/validation/finance.validation";
import type { PaginationInput } from "@/types/api";

export interface FinanceListParams {
  search?: string;
  pagination: PaginationInput;
}

export type FinanceActionInput = z.infer<typeof financeActionSchema>;

import type { z } from "zod";

import type { ReimbursementStatus } from "@/generated/prisma/enums";
import type {
  reimbursementItemSchema,
  reimbursementListQuerySchema,
  reimbursementMutationSchema,
} from "@/modules/reimbursement/validation/reimbursement.validation";
import type { PaginationInput } from "@/types/api";

export interface ReimbursementListParams {
  requesterId: string;
  search?: string;
  status?: ReimbursementStatus;
  pagination: PaginationInput;
}

export type ReimbursementItemInput = z.infer<typeof reimbursementItemSchema>;
export type ReimbursementMutationInput = z.infer<
  typeof reimbursementMutationSchema
>;
export type ReimbursementListQuery = z.infer<
  typeof reimbursementListQuerySchema
>;

export interface ReimbursementFormState {
  success: boolean;
  message?: string;
}

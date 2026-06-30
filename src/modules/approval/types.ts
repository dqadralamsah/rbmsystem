import type { z } from "zod";

import type { approvalActionSchema } from "@/modules/approval/validation/approval.validation";
import type { PaginationInput } from "@/types/api";

export interface ApprovalListParams {
  managerId: string;
  search?: string;
  pagination: PaginationInput;
}

export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;

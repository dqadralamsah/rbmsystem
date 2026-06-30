import { z } from "zod";

export const approvalActionSchema = z.object({
  notes: z.string().trim().min(1, "Approval note is required.").max(500),
});

export const approvalListQuerySchema = z.object({
  search: z.string().trim().optional(),
});

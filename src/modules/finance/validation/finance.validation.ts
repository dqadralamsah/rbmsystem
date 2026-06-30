import { z } from "zod";

export const financeActionSchema = z.object({
  notes: z.string().trim().min(1, "Finance note is required.").max(500),
});

export const financeListQuerySchema = z.object({
  search: z.string().trim().optional(),
});

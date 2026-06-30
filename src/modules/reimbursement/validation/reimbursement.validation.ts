import { z } from "zod";

import { ReimbursementStatus } from "@/generated/prisma/enums";

const decimalStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number.")
  .refine((value) => Number(value) > 0, "Amount must be greater than 0.");

export const reimbursementItemSchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required."),
  description: z.string().trim().min(1, "Description is required.").max(255),
  amount: decimalStringSchema,
});

export const reimbursementMutationSchema = z.object({
  description: z.string().trim().max(500).nullable().optional(),
  items: z
    .array(reimbursementItemSchema)
    .min(1, "At least one reimbursement item is required."),
});

export const reimbursementListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(ReimbursementStatus).optional(),
});

export const reimbursementIdSchema = z.object({
  id: z.string().trim().min(1),
});

export type ReimbursementMutationSchema = z.infer<
  typeof reimbursementMutationSchema
>;

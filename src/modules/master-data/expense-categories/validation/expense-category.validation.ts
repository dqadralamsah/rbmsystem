import { z } from "zod";

const categoryCodeSchema = z.string().trim().min(1).max(30);
const categoryNameSchema = z.string().trim().min(1).max(100);
const categoryDescriptionSchema = z.string().trim().min(1).max(255).nullable();

export const expenseCategoryListQuerySchema = z.object({
  search: z.string().trim().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  status: z.enum(["active", "deleted", "all"]).optional(),
});

export const createExpenseCategorySchema = z.object({
  code: categoryCodeSchema,
  name: categoryNameSchema,
  description: categoryDescriptionSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateExpenseCategorySchema = createExpenseCategorySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

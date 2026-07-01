import { z } from "zod";

export const roleListQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(255).nullable().optional(),
});

export const updateRoleSchema = createRoleSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

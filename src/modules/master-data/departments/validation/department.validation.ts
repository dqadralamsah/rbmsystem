import { z } from "zod";

const departmentCodeSchema = z.string().trim().min(1).max(30);
const departmentNameSchema = z.string().trim().min(1).max(100);

export const departmentListQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export const createDepartmentSchema = z.object({
  code: departmentCodeSchema,
  name: departmentNameSchema,
});

export const updateDepartmentSchema = createDepartmentSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

import { z } from "zod";

import { UserStatus } from "@/generated/prisma/enums";

const optionalStringSchema = z.string().trim().min(1).max(50).nullable();

export const employeeListQuerySchema = z.object({
  search: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  roleId: z.string().trim().optional(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]).optional(),
});

export const createEmployeeSchema = z.object({
  employeeId: optionalStringSchema.optional(),
  email: z.string().trim().email().max(150),
  fullName: z.string().trim().min(1).max(150),
  departmentId: z.string().trim().min(1),
  roleId: z.string().trim().min(1),
  managerId: z.string().trim().min(1).nullable().optional(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

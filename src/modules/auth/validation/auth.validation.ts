import { z } from "zod";

export const developmentLoginSchema = z.object({
  userId: z.string().min(1, "Please select a user."),
});

export const authSessionSchema = z.object({
  userId: z.string().min(1),
  employeeId: z.string().min(1).nullable(),
  fullName: z.string().min(1),
  role: z.string().min(1),
  departmentId: z.string().min(1),
});

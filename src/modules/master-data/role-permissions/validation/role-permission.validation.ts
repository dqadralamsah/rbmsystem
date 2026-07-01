import { z } from "zod";

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().trim().min(1)),
});

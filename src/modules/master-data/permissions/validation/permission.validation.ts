import { z } from "zod";

export const permissionListQuerySchema = z.object({
  search: z.string().trim().optional(),
});

import type { z } from "zod";

import type { updateRolePermissionsSchema } from "@/modules/master-data/role-permissions/validation/role-permission.validation";

export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>;

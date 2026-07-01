import "server-only";

import { createPaginationMeta } from "@/lib/api";
import * as permissionRepository from "@/modules/master-data/permissions/repositories/permission.repository";
import type { PermissionListParams } from "@/modules/master-data/permissions/types";

export async function listPermissions(params: PermissionListParams) {
  const [permissions, totalItems] = await Promise.all([
    permissionRepository.findPermissions(params),
    permissionRepository.countPermissions(params.search),
  ]);

  return {
    data: permissions,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

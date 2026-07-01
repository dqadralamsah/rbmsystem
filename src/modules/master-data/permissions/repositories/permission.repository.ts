import "server-only";

import { prisma } from "@/lib/prisma";
import type { PermissionListParams } from "@/modules/master-data/permissions/types";

function createPermissionWhere(search?: string) {
  return {
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };
}

export async function countPermissions(search?: string) {
  return prisma.permission.count({
    where: createPermissionWhere(search),
  });
}

export async function findPermissions({
  search,
  pagination,
}: PermissionListParams) {
  return prisma.permission.findMany({
    where: createPermissionWhere(search),
    orderBy: {
      code: "asc",
    },
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });
}

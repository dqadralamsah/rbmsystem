import "server-only";

import { prisma } from "@/lib/prisma";

export async function findRolePermissionMatrix(roleId: string) {
  const [role, permissions] = await Promise.all([
    prisma.role.findFirst({
      where: {
        id: roleId,
        deletedAt: null,
      },
      include: {
        permissions: {
          select: {
            permissionId: true,
          },
        },
      },
    }),
    prisma.permission.findMany({
      orderBy: {
        code: "asc",
      },
    }),
  ]);

  return {
    role,
    permissions,
  };
}

export async function countPermissionsByIds(permissionIds: string[]) {
  return prisma.permission.count({
    where: {
      id: {
        in: permissionIds,
      },
    },
  });
}

export async function replaceRolePermissions(
  roleId: string,
  permissionIds: string[],
) {
  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  });
}

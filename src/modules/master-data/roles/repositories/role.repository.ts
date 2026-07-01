import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CreateRoleInput,
  RoleListParams,
  UpdateRoleInput,
} from "@/modules/master-data/roles/types";

const roleInclude = {
  permissions: {
    include: {
      permission: true,
    },
    orderBy: {
      permission: {
        code: "asc" as const,
      },
    },
  },
  _count: {
    select: {
      users: true,
    },
  },
};

function createRoleWhere(search?: string) {
  return {
    deletedAt: null,
    ...(search
      ? {
          OR: [
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

export async function countRoles(search?: string) {
  return prisma.role.count({
    where: createRoleWhere(search),
  });
}

export async function findRoles({ search, pagination }: RoleListParams) {
  return prisma.role.findMany({
    where: createRoleWhere(search),
    include: roleInclude,
    orderBy: {
      name: "asc",
    },
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });
}

export async function findRoleById(id: string) {
  return prisma.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: roleInclude,
  });
}

export async function findRoleByName(name: string, excludeId?: string) {
  return prisma.role.findFirst({
    where: {
      name,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createRole(data: CreateRoleInput) {
  return prisma.role.create({
    data,
    include: roleInclude,
  });
}

export async function updateRole(id: string, data: UpdateRoleInput) {
  return prisma.role.update({
    where: { id },
    data,
    include: roleInclude,
  });
}

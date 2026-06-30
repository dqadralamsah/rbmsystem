import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CreateDepartmentInput,
  DepartmentListParams,
  UpdateDepartmentInput,
} from "@/modules/master-data/departments/types";

function createDepartmentWhere(search?: string) {
  return {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function countDepartments(search?: string) {
  return prisma.department.count({
    where: createDepartmentWhere(search),
  });
}

export async function findDepartments({
  search,
  pagination,
}: DepartmentListParams) {
  return prisma.department.findMany({
    where: createDepartmentWhere(search),
    orderBy: [{ name: "asc" }, { code: "asc" }],
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });
}

export async function findDepartmentById(id: string) {
  return prisma.department.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function findDepartmentByCode(code: string, excludeId?: string) {
  return prisma.department.findFirst({
    where: {
      code,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createDepartment(data: CreateDepartmentInput) {
  return prisma.department.create({
    data,
  });
}

export async function updateDepartment(
  id: string,
  data: UpdateDepartmentInput,
) {
  return prisma.department.update({
    where: { id },
    data,
  });
}

export async function softDeleteDepartment(id: string) {
  return prisma.department.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

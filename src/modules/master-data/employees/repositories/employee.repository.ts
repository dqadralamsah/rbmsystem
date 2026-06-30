import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CreateEmployeeInput,
  EmployeeListParams,
  UpdateEmployeeInput,
} from "@/modules/master-data/employees/types";

const employeeInclude = {
  department: true,
  role: true,
  manager: {
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      email: true,
    },
  },
};

function createEmployeeWhere(search?: string) {
  return {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { employeeId: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { fullName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function countEmployees(search?: string) {
  return prisma.user.count({
    where: createEmployeeWhere(search),
  });
}

export async function findEmployees({ search, pagination }: EmployeeListParams) {
  return prisma.user.findMany({
    where: createEmployeeWhere(search),
    include: employeeInclude,
    orderBy: [{ fullName: "asc" }, { email: "asc" }],
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });
}

export async function findEmployeeById(id: string) {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: employeeInclude,
  });
}

export async function findEmployeeByEmail(email: string, excludeId?: string) {
  return prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function findEmployeeByEmployeeId(
  employeeId: string,
  excludeId?: string,
) {
  return prisma.user.findFirst({
    where: {
      employeeId,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
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

export async function findRoleById(id: string) {
  return prisma.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function createEmployee(data: CreateEmployeeInput) {
  return prisma.user.create({
    data,
    include: employeeInclude,
  });
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput) {
  return prisma.user.update({
    where: { id },
    data,
    include: employeeInclude,
  });
}

export async function softDeleteEmployee(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

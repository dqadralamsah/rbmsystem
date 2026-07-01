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

function createEmployeeWhere({
  search,
  departmentId,
  roleId,
  status,
}: Pick<
  EmployeeListParams,
  "search" | "departmentId" | "roleId" | "status"
>) {
  return {
    deletedAt: null,
    ...(departmentId ? { departmentId } : {}),
    ...(roleId ? { roleId } : {}),
    ...(status ? { status } : {}),
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

export async function countEmployees(params: Pick<
  EmployeeListParams,
  "search" | "departmentId" | "roleId" | "status"
>) {
  return prisma.user.count({
    where: createEmployeeWhere(params),
  });
}

export async function findEmployees(params: EmployeeListParams) {
  return prisma.user.findMany({
    where: createEmployeeWhere(params),
    include: employeeInclude,
    orderBy: [{ fullName: "asc" }, { email: "asc" }],
    skip: (params.pagination.page - 1) * params.pagination.pageSize,
    take: params.pagination.pageSize,
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

export async function countActiveEmployeeReimbursements(id: string) {
  return prisma.reimbursement.count({
    where: {
      requesterId: id,
      status: {
        notIn: [
          "REJECTED_BY_MANAGER",
          "REJECTED_BY_FINANCE",
          "COMPLETED",
        ],
      },
    },
  });
}

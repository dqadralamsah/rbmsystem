import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CreateExpenseCategoryInput,
  ExpenseCategoryListParams,
  UpdateExpenseCategoryInput,
} from "@/modules/master-data/expense-categories/types";

function createExpenseCategoryWhere({
  search,
  isActive,
  status = "active",
}: Pick<ExpenseCategoryListParams, "search" | "isActive" | "status">) {
  return {
    ...(status === "active" ? { deletedAt: null } : {}),
    ...(status === "deleted" ? { deletedAt: { not: null } } : {}),
    ...(typeof isActive === "boolean" ? { isActive } : {}),
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

export async function countExpenseCategories(
  params: Pick<ExpenseCategoryListParams, "search" | "isActive" | "status">,
) {
  return prisma.reimbursementCategory.count({
    where: createExpenseCategoryWhere(params),
  });
}

export async function findExpenseCategories({
  search,
  isActive,
  status,
  pagination,
}: ExpenseCategoryListParams) {
  return prisma.reimbursementCategory.findMany({
    where: createExpenseCategoryWhere({ search, isActive, status }),
    orderBy: [{ name: "asc" }, { code: "asc" }],
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });
}

export async function findExpenseCategoryById(id: string) {
  return prisma.reimbursementCategory.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function findExpenseCategoryByCode(
  code: string,
  excludeId?: string,
) {
  return prisma.reimbursementCategory.findFirst({
    where: {
      code,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createExpenseCategory(
  data: CreateExpenseCategoryInput,
) {
  return prisma.reimbursementCategory.create({
    data,
  });
}

export async function updateExpenseCategory(
  id: string,
  data: UpdateExpenseCategoryInput,
) {
  return prisma.reimbursementCategory.update({
    where: { id },
    data,
  });
}

export async function softDeleteExpenseCategory(id: string) {
  return prisma.reimbursementCategory.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

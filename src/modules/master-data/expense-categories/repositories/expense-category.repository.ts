import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CreateExpenseCategoryInput,
  ExpenseCategoryListParams,
  UpdateExpenseCategoryInput,
} from "@/modules/master-data/expense-categories/types";

function createExpenseCategoryWhere(search?: string) {
  return {
    deletedAt: null,
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

export async function countExpenseCategories(search?: string) {
  return prisma.reimbursementCategory.count({
    where: createExpenseCategoryWhere(search),
  });
}

export async function findExpenseCategories({
  search,
  pagination,
}: ExpenseCategoryListParams) {
  return prisma.reimbursementCategory.findMany({
    where: createExpenseCategoryWhere(search),
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

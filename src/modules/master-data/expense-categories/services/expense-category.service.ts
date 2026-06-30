import "server-only";

import { createPaginationMeta } from "@/lib/api";
import {
  ConflictError,
  NotFoundError,
} from "@/lib/errors";
import * as expenseCategoryRepository from "@/modules/master-data/expense-categories/repositories/expense-category.repository";
import type {
  CreateExpenseCategoryInput,
  ExpenseCategoryListParams,
  UpdateExpenseCategoryInput,
} from "@/modules/master-data/expense-categories/types";

export async function listExpenseCategories(
  params: ExpenseCategoryListParams,
) {
  const [expenseCategories, totalItems] = await Promise.all([
    expenseCategoryRepository.findExpenseCategories(params),
    expenseCategoryRepository.countExpenseCategories(params.search),
  ]);

  return {
    data: expenseCategories,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getExpenseCategory(id: string) {
  const expenseCategory =
    await expenseCategoryRepository.findExpenseCategoryById(id);

  if (!expenseCategory) {
    throw new NotFoundError("Expense category was not found.");
  }

  return expenseCategory;
}

export async function createExpenseCategory(
  input: CreateExpenseCategoryInput,
) {
  const existingCategory =
    await expenseCategoryRepository.findExpenseCategoryByCode(input.code);

  if (existingCategory) {
    throw new ConflictError("Expense category code already exists.");
  }

  return expenseCategoryRepository.createExpenseCategory({
    ...input,
    isActive: input.isActive ?? true,
  });
}

export async function updateExpenseCategory(
  id: string,
  input: UpdateExpenseCategoryInput,
) {
  await getExpenseCategory(id);

  if (input.code) {
    const existingCategory =
      await expenseCategoryRepository.findExpenseCategoryByCode(input.code, id);

    if (existingCategory) {
      throw new ConflictError("Expense category code already exists.");
    }
  }

  return expenseCategoryRepository.updateExpenseCategory(id, input);
}

export async function deleteExpenseCategory(id: string) {
  await getExpenseCategory(id);
  await expenseCategoryRepository.softDeleteExpenseCategory(id);
}

import type { NextRequest } from "next/server";

import {
  apiNoContent,
  apiSuccess,
  validateRequestBody,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  deleteExpenseCategory,
  getExpenseCategory,
  updateExpenseCategory,
  updateExpenseCategorySchema,
} from "@/modules/master-data/expense-categories";

const EXPENSE_CATEGORY_PERMISSION = "master.category";

interface ExpenseCategoryRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiPermission<ExpenseCategoryRouteContext>(
  EXPENSE_CATEGORY_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const expenseCategory = await getExpenseCategory(id);

    return apiSuccess(expenseCategory);
  },
);

export const PATCH = withApiPermission<ExpenseCategoryRouteContext>(
  EXPENSE_CATEGORY_PERMISSION,
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(
      request,
      updateExpenseCategorySchema,
    );
    const expenseCategory = await updateExpenseCategory(id, payload);

    return apiSuccess(expenseCategory, {
      message: "Expense category updated.",
    });
  },
);

export const DELETE = withApiPermission<ExpenseCategoryRouteContext>(
  EXPENSE_CATEGORY_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    await deleteExpenseCategory(id);

    return apiNoContent();
  },
);

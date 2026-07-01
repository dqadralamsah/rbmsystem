import type { NextRequest } from "next/server";

import {
  apiNoContent,
  apiSuccess,
  validateRequestBody,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
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
    const oldExpenseCategory = await getExpenseCategory(id);
    const expenseCategory = await updateExpenseCategory(id, payload);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.UPDATE,
      resource: "ReimbursementCategory",
      resourceId: expenseCategory.id,
      description: "Updated reimbursement category.",
      oldValues: oldExpenseCategory,
      newValues: expenseCategory,
    });

    return apiSuccess(expenseCategory, {
      message: "Expense category updated.",
    });
  },
);

export const DELETE = withApiPermission<ExpenseCategoryRouteContext>(
  EXPENSE_CATEGORY_PERMISSION,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const expenseCategory = await getExpenseCategory(id);

    await deleteExpenseCategory(id);
    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.DELETE,
      resource: "ReimbursementCategory",
      resourceId: expenseCategory.id,
      description: "Deleted reimbursement category.",
      oldValues: expenseCategory,
    });

    return apiNoContent();
  },
);

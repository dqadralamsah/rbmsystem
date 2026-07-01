import type { NextRequest } from "next/server";

import {
  apiCreated,
  apiPaginated,
  parsePagination,
  validateRequestBody,
  validateSearchParams,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
import {
  createExpenseCategory,
  createExpenseCategorySchema,
  expenseCategoryListQuerySchema,
  listExpenseCategories,
} from "@/modules/master-data/expense-categories";

const EXPENSE_CATEGORY_PERMISSION = "master.category";

export const GET = withApiPermission(
  EXPENSE_CATEGORY_PERMISSION,
  async (request: NextRequest) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      expenseCategoryListQuerySchema,
    );
    const result = await listExpenseCategories({
      search: query.search,
      isActive: query.isActive,
      status: query.status,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

export const POST = withApiPermission(
  EXPENSE_CATEGORY_PERMISSION,
  async (request: NextRequest, context) => {
    const payload = await validateRequestBody(
      request,
      createExpenseCategorySchema,
    );
    const expenseCategory = await createExpenseCategory(payload);

    await recordMutationAuditLog({
      actor: context.user,
      action: AuditAction.CREATE,
      resource: "ReimbursementCategory",
      resourceId: expenseCategory.id,
      description: "Created reimbursement category.",
      newValues: expenseCategory,
    });

    return apiCreated(expenseCategory, "Expense category created.");
  },
);

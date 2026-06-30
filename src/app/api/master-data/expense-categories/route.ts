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
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

export const POST = withApiPermission(
  EXPENSE_CATEGORY_PERMISSION,
  async (request: NextRequest) => {
    const payload = await validateRequestBody(
      request,
      createExpenseCategorySchema,
    );
    const expenseCategory = await createExpenseCategory(payload);

    return apiCreated(expenseCategory, "Expense category created.");
  },
);

import type { NextRequest } from "next/server";

import {
  apiPaginated,
  parsePagination,
  validateSearchParams,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  financeListQuerySchema,
  listFinanceQueue,
} from "@/modules/finance";

export const GET = withApiPermission(
  "finance.review",
  async (request: NextRequest) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      financeListQuerySchema,
    );
    const result = await listFinanceQueue({
      search: query.search,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

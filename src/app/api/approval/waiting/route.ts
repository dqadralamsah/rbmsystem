import type { NextRequest } from "next/server";

import {
  apiPaginated,
  parsePagination,
  validateSearchParams,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  approvalListQuerySchema,
  listWaitingApprovals,
} from "@/modules/approval";

export const GET = withApiPermission(
  "approval.review",
  async (request: NextRequest, context) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      approvalListQuerySchema,
    );
    const result = await listWaitingApprovals({
      managerId: context.user.userId,
      search: query.search,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

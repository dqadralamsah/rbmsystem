import type { NextRequest } from "next/server";

import {
  apiPaginated,
  parsePagination,
  validateSearchParams,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  REIMBURSEMENT_PERMISSIONS,
  listMyReimbursements,
  reimbursementListQuerySchema,
} from "@/modules/reimbursement";

export const GET = withApiPermission(
  REIMBURSEMENT_PERMISSIONS.create,
  async (request: NextRequest, context) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      reimbursementListQuerySchema,
    );
    const result = await listMyReimbursements({
      requesterId: context.user.userId,
      search: query.search,
      status: query.status,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);

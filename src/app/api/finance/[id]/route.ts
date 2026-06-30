import type { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import { getFinanceDetail } from "@/modules/finance";

interface FinanceRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiPermission<FinanceRouteContext>(
  "finance.review",
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const reimbursement = await getFinanceDetail(id);

    return apiSuccess(reimbursement);
  },
);

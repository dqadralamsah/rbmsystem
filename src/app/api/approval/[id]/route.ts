import type { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import { getApprovalDetail } from "@/modules/approval";

interface ApprovalRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiPermission<ApprovalRouteContext>(
  "approval.review",
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const reimbursement = await getApprovalDetail(id, context.user);

    return apiSuccess(reimbursement);
  },
);

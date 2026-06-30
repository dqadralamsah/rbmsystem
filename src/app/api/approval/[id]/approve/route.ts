import type { NextRequest } from "next/server";

import { apiSuccess, validateRequestBody } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  approvalActionSchema,
  approveReimbursement,
} from "@/modules/approval";

interface ApprovalApproveRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const POST = withApiPermission<ApprovalApproveRouteContext>(
  "approval.approve",
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, approvalActionSchema);
    const reimbursement = await approveReimbursement(id, payload, context.user);

    return apiSuccess(reimbursement, {
      message: "Reimbursement approved by manager.",
    });
  },
);

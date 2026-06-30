import type { NextRequest } from "next/server";

import { apiSuccess, validateRequestBody } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  approvalActionSchema,
  rejectReimbursement,
} from "@/modules/approval";

interface ApprovalRejectRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const POST = withApiPermission<ApprovalRejectRouteContext>(
  "approval.reject",
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, approvalActionSchema);
    const reimbursement = await rejectReimbursement(id, payload, context.user);

    return apiSuccess(reimbursement, {
      message: "Reimbursement rejected by manager.",
    });
  },
);

import type { NextRequest } from "next/server";

import { apiSuccess, validateRequestBody } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  approvalActionSchema,
  returnReimbursement,
} from "@/modules/approval";

interface ApprovalReturnRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const POST = withApiPermission<ApprovalReturnRouteContext>(
  "approval.return",
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, approvalActionSchema);
    const reimbursement = await returnReimbursement(id, payload, context.user);

    return apiSuccess(reimbursement, {
      message: "Reimbursement returned by manager.",
    });
  },
);

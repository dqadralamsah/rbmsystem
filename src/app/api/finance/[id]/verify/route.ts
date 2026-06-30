import type { NextRequest } from "next/server";

import { apiSuccess, validateRequestBody } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  financeActionSchema,
  verifyReimbursement,
} from "@/modules/finance";

interface FinanceVerifyRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const POST = withApiPermission<FinanceVerifyRouteContext>(
  "finance.approve",
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, financeActionSchema);
    const reimbursement = await verifyReimbursement(id, payload, context.user);

    return apiSuccess(reimbursement, {
      message: "Reimbursement verified by finance.",
    });
  },
);

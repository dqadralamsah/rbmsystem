import type { NextRequest } from "next/server";

import { apiSuccess, validateRequestBody } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  financeActionSchema,
  returnReimbursement,
} from "@/modules/finance";

interface FinanceReturnRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const POST = withApiPermission<FinanceReturnRouteContext>(
  "finance.return",
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, financeActionSchema);
    const reimbursement = await returnReimbursement(id, payload, context.user);

    return apiSuccess(reimbursement, {
      message: "Reimbursement returned by finance.",
    });
  },
);

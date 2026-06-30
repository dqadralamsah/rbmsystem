import type { NextRequest } from "next/server";

import { apiSuccess, validateRequestBody } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  financeActionSchema,
  markReimbursementAsPaid,
} from "@/modules/finance";

interface FinanceMarkPaidRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const POST = withApiPermission<FinanceMarkPaidRouteContext>(
  "finance.mark_paid",
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(request, financeActionSchema);
    const reimbursement = await markReimbursementAsPaid(
      id,
      payload,
      context.user,
    );

    return apiSuccess(reimbursement, {
      message: "Reimbursement marked as paid and completed.",
    });
  },
);

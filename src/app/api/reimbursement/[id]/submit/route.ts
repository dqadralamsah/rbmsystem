import type { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  REIMBURSEMENT_PERMISSIONS,
  submitDraftReimbursement,
} from "@/modules/reimbursement";

interface ReimbursementSubmitRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const POST = withApiPermission<ReimbursementSubmitRouteContext>(
  REIMBURSEMENT_PERMISSIONS.submit,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const reimbursement = await submitDraftReimbursement(id, context.user);

    return apiSuccess(reimbursement, {
      message: "Reimbursement submitted.",
    });
  },
);

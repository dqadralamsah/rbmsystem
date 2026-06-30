import type { NextRequest } from "next/server";

import {
  apiCreated,
  validateRequestBody,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  REIMBURSEMENT_PERMISSIONS,
  createDraftReimbursement,
  reimbursementMutationSchema,
} from "@/modules/reimbursement";

export const POST = withApiPermission(
  REIMBURSEMENT_PERMISSIONS.create,
  async (request: NextRequest, context) => {
    const payload = await validateRequestBody(
      request,
      reimbursementMutationSchema,
    );
    const reimbursement = await createDraftReimbursement(payload, context.user);

    return apiCreated(reimbursement, "Reimbursement draft created.");
  },
);

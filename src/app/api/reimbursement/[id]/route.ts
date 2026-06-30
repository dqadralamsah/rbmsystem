import type { NextRequest } from "next/server";

import {
  apiNoContent,
  apiSuccess,
  validateRequestBody,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  REIMBURSEMENT_PERMISSIONS,
  deleteDraftReimbursement,
  getMyReimbursement,
  reimbursementMutationSchema,
  updateDraftReimbursement,
} from "@/modules/reimbursement";

interface ReimbursementRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiPermission<ReimbursementRouteContext>(
  REIMBURSEMENT_PERMISSIONS.create,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;
    const reimbursement = await getMyReimbursement(id, context.user);

    return apiSuccess(reimbursement);
  },
);

export const PATCH = withApiPermission<ReimbursementRouteContext>(
  REIMBURSEMENT_PERMISSIONS.update,
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = await validateRequestBody(
      request,
      reimbursementMutationSchema,
    );
    const reimbursement = await updateDraftReimbursement(
      id,
      payload,
      context.user,
    );

    return apiSuccess(reimbursement, {
      message: "Reimbursement draft updated.",
    });
  },
);

export const DELETE = withApiPermission<ReimbursementRouteContext>(
  REIMBURSEMENT_PERMISSIONS.update,
  async (_request: NextRequest, context) => {
    const { id } = await context.params;

    await deleteDraftReimbursement(id, context.user);

    return apiNoContent();
  },
);

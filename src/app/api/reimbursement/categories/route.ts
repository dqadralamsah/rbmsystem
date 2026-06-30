import { apiSuccess } from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  REIMBURSEMENT_PERMISSIONS,
  listActiveReimbursementCategories,
} from "@/modules/reimbursement";

export const GET = withApiPermission(
  REIMBURSEMENT_PERMISSIONS.create,
  async () => {
    const categories = await listActiveReimbursementCategories();

    return apiSuccess(categories);
  },
);

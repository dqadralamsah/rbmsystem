import { apiSuccess } from "@/lib/api";
import { withApiAuth } from "@/lib/auth/route-handlers";
import { getDashboardData } from "@/modules/dashboard";

export const GET = withApiAuth(async (_request, context) => {
  const dashboard = await getDashboardData(context.user);

  return apiSuccess(dashboard);
});

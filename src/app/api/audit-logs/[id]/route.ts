import { apiSuccess } from "@/lib/api";
import { withApiAuth } from "@/lib/auth/route-handlers";
import { getAuditLog } from "@/modules/audit-log";

interface AuditLogRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withApiAuth<AuditLogRouteContext>(
  async (_request, context) => {
    const { id } = await context.params;
    const auditLog = await getAuditLog(id, context.user);

    return apiSuccess(auditLog);
  },
);

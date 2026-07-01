import { apiPaginated, parsePagination } from "@/lib/api";
import { withApiAuth } from "@/lib/auth/route-handlers";
import {
  auditLogListQuerySchema,
  listAuditLogs,
} from "@/modules/audit-log";

export const GET = withApiAuth(async (request, context) => {
  const pagination = parsePagination(request.nextUrl.searchParams);
  const filters = auditLogListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const auditLogs = await listAuditLogs(
    {
      ...filters,
      pagination,
    },
    context.user,
  );

  return apiPaginated(auditLogs.data, auditLogs.meta);
});

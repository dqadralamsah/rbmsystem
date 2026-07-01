import "server-only";

import { AuditAction } from "@/generated/prisma/enums";
import { createPaginationMeta } from "@/lib/api";
import { isAdmin } from "@/lib/auth/authorization";
import { AuthorizationError, NotFoundError } from "@/lib/errors";
import * as auditLogRepository from "@/modules/audit-log/repositories/audit-log.repository";
import type {
  AuditLogListParams,
  AuditLogRecordInput,
} from "@/modules/audit-log/types";
import type { CurrentUser } from "@/types/auth";

function ensureSuperAdmin(user: CurrentUser) {
  if (!isAdmin(user)) {
    throw new AuthorizationError(
      "Only Super Admin can access audit logs.",
    );
  }
}

export async function recordAuditLog(
  input: Omit<AuditLogRecordInput, "actorId">,
  actor?: Pick<CurrentUser, "userId"> | null,
) {
  return auditLogRepository.createAuditLog({
    ...input,
    actorId: actor?.userId ?? null,
  });
}

export async function recordMutationAuditLog({
  actor,
  action,
  resource,
  resourceId,
  description,
  oldValues,
  newValues,
  metadata,
}: Omit<AuditLogRecordInput, "actorId"> & {
  actor?: Pick<CurrentUser, "userId"> | null;
}) {
  return recordAuditLog(
    {
      action,
      resource,
      resourceId,
      description,
      oldValues,
      newValues,
      metadata,
    },
    actor,
  );
}

export async function listAuditLogs(
  params: AuditLogListParams,
  user: CurrentUser,
) {
  ensureSuperAdmin(user);

  const [auditLogs, totalItems] = await Promise.all([
    auditLogRepository.findAuditLogs(params),
    auditLogRepository.countAuditLogs(params),
  ]);

  return {
    data: auditLogs,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getAuditLog(id: string, user: CurrentUser) {
  ensureSuperAdmin(user);

  const auditLog = await auditLogRepository.findAuditLogById(id);

  if (!auditLog) {
    throw new NotFoundError("Audit log was not found.");
  }

  return auditLog;
}

export { AuditAction };

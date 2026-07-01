import type { AuditAction } from "@/generated/prisma/enums";
import type { PaginationInput } from "@/types/api";

export interface AuditLogRecordInput {
  actorId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  description?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  metadata?: unknown;
}

export interface AuditLogListParams {
  search?: string;
  action?: AuditAction;
  resource?: string;
  actorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  pagination: PaginationInput;
}

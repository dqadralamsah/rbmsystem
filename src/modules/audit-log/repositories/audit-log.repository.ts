import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AuditLogListParams,
  AuditLogRecordInput,
} from "@/modules/audit-log/types";

const auditActorSelect = {
  id: true,
  employeeId: true,
  fullName: true,
  email: true,
  role: {
    select: {
      name: true,
    },
  },
  department: {
    select: {
      name: true,
    },
  },
};

const auditLogInclude = {
  actor: {
    select: auditActorSelect,
  },
};

function toAuditJsonValue(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function createAuditLogWhere({
  search,
  action,
  resource,
  actorId,
  dateFrom,
  dateTo,
}: Omit<AuditLogListParams, "pagination">): Prisma.AuditLogWhereInput {
  return {
    ...(action ? { action } : {}),
    ...(resource ? { resource } : {}),
    ...(actorId ? { actorId } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { resource: { contains: search, mode: "insensitive" as const } },
            { resourceId: { contains: search, mode: "insensitive" as const } },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              actor: {
                fullName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function createAuditLog(input: AuditLogRecordInput) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      description: input.description ?? null,
      oldValues: toAuditJsonValue(input.oldValues),
      newValues: toAuditJsonValue(input.newValues),
      metadata: toAuditJsonValue(input.metadata),
    },
  });
}

export async function countAuditLogs(params: AuditLogListParams) {
  return prisma.auditLog.count({
    where: createAuditLogWhere(params),
  });
}

export async function findAuditLogs(params: AuditLogListParams) {
  return prisma.auditLog.findMany({
    where: createAuditLogWhere(params),
    include: auditLogInclude,
    orderBy: {
      createdAt: "desc",
    },
    skip: (params.pagination.page - 1) * params.pagination.pageSize,
    take: params.pagination.pageSize,
  });
}

export async function findAuditLogById(id: string) {
  return prisma.auditLog.findUnique({
    where: { id },
    include: auditLogInclude,
  });
}

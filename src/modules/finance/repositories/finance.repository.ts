import "server-only";

import { ReimbursementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { FinanceListParams } from "@/modules/finance/types";

const financeInclude = {
  requester: {
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      department: {
        select: {
          name: true,
        },
      },
    },
  },
  items: {
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  workflowHistories: {
    include: {
      performedBy: {
        select: {
          id: true,
          fullName: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
};

function createFinanceQueueWhere(search?: string) {
  return {
    status: {
      in: [
        ReimbursementStatus.APPROVED_BY_MANAGER,
        ReimbursementStatus.APPROVED_BY_FINANCE,
      ],
    },
    ...(search
      ? {
          OR: [
            { number: { contains: search, mode: "insensitive" as const } },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              requester: {
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

export async function countFinanceQueue(params: FinanceListParams) {
  return prisma.reimbursement.count({
    where: createFinanceQueueWhere(params.search),
  });
}

export async function findFinanceQueue(params: FinanceListParams) {
  return prisma.reimbursement.findMany({
    where: createFinanceQueueWhere(params.search),
    include: {
      requester: {
        select: {
          fullName: true,
          employeeId: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
      items: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      updatedAt: "asc",
    },
    skip: (params.pagination.page - 1) * params.pagination.pageSize,
    take: params.pagination.pageSize,
  });
}

export async function findFinanceDetail(id: string) {
  return prisma.reimbursement.findUnique({
    where: { id },
    include: financeInclude,
  });
}

export async function verifyReimbursement(
  id: string,
  financeUserId: string,
  notes: string,
) {
  return prisma.$transaction(async (tx) => {
    const reimbursement = await tx.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.APPROVED_BY_FINANCE,
        workflowHistories: {
          create: {
            action: "APPROVE",
            fromStatus: ReimbursementStatus.APPROVED_BY_MANAGER,
            toStatus: ReimbursementStatus.APPROVED_BY_FINANCE,
            performedById: financeUserId,
            notes,
          },
        },
      },
    });

    return tx.reimbursement.findUnique({
      where: { id: reimbursement.id },
      include: financeInclude,
    });
  });
}

export async function returnReimbursement(
  id: string,
  financeUserId: string,
  notes: string,
) {
  return prisma.$transaction(async (tx) => {
    const reimbursement = await tx.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.RETURNED_BY_FINANCE,
        workflowHistories: {
          create: {
            action: "RETURN",
            fromStatus: ReimbursementStatus.APPROVED_BY_MANAGER,
            toStatus: ReimbursementStatus.RETURNED_BY_FINANCE,
            performedById: financeUserId,
            notes,
          },
        },
      },
    });

    return tx.reimbursement.findUnique({
      where: { id: reimbursement.id },
      include: financeInclude,
    });
  });
}

export async function markReimbursementAsPaid(
  id: string,
  financeUserId: string,
  notes: string,
  paidAt: Date,
) {
  return prisma.$transaction(async (tx) => {
    const reimbursement = await tx.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.COMPLETED,
        paidAt,
        completedAt: paidAt,
        workflowHistories: {
          create: [
            {
              action: "MARK_AS_PAID",
              fromStatus: ReimbursementStatus.APPROVED_BY_FINANCE,
              toStatus: ReimbursementStatus.PAID,
              performedById: financeUserId,
              notes,
            },
            {
              action: "COMPLETE",
              fromStatus: ReimbursementStatus.PAID,
              toStatus: ReimbursementStatus.COMPLETED,
              performedById: financeUserId,
              notes: "Completed after payment confirmation.",
            },
          ],
        },
      },
    });

    return tx.reimbursement.findUnique({
      where: { id: reimbursement.id },
      include: financeInclude,
    });
  });
}

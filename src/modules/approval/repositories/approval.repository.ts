import "server-only";

import { ReimbursementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { ApprovalListParams } from "@/modules/approval/types";

export type ApprovalDatabaseClient = Pick<
  typeof prisma,
  "reimbursement" | "workflowHistory"
>;

const approvalInclude = {
  requester: {
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      managerId: true,
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

function createWaitingApprovalWhere({
  managerId,
  search,
}: Pick<ApprovalListParams, "managerId" | "search">) {
  return {
    status: ReimbursementStatus.SUBMITTED,
    requester: {
      managerId,
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

export async function countWaitingApprovals(params: ApprovalListParams) {
  return prisma.reimbursement.count({
    where: createWaitingApprovalWhere(params),
  });
}

export async function findWaitingApprovals(params: ApprovalListParams) {
  return prisma.reimbursement.findMany({
    where: createWaitingApprovalWhere(params),
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
      submittedAt: "asc",
    },
    skip: (params.pagination.page - 1) * params.pagination.pageSize,
    take: params.pagination.pageSize,
  });
}

export async function findApprovalDetail(id: string) {
  return prisma.reimbursement.findUnique({
    where: { id },
    include: approvalInclude,
  });
}

export async function approveReimbursement(
  id: string,
  managerId: string,
  notes: string,
) {
  return prisma.$transaction(async (tx) => {
    const reimbursement = await tx.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.APPROVED_BY_MANAGER,
        workflowHistories: {
          create: {
            action: "APPROVE",
            fromStatus: ReimbursementStatus.SUBMITTED,
            toStatus: ReimbursementStatus.APPROVED_BY_MANAGER,
            performedById: managerId,
            notes,
          },
        },
      },
    });

    return tx.reimbursement.findUnique({
      where: { id: reimbursement.id },
      include: approvalInclude,
    });
  });
}

export async function rejectReimbursement(
  id: string,
  managerId: string,
  notes: string,
) {
  return prisma.$transaction(async (tx) => {
    const reimbursement = await tx.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.REJECTED_BY_MANAGER,
        workflowHistories: {
          create: {
            action: "REJECT",
            fromStatus: ReimbursementStatus.SUBMITTED,
            toStatus: ReimbursementStatus.REJECTED_BY_MANAGER,
            performedById: managerId,
            notes,
          },
        },
      },
    });

    return tx.reimbursement.findUnique({
      where: { id: reimbursement.id },
      include: approvalInclude,
    });
  });
}

export async function returnReimbursement(
  id: string,
  managerId: string,
  notes: string,
) {
  return prisma.$transaction(async (tx) => {
    const reimbursement = await tx.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.RETURNED_BY_MANAGER,
        workflowHistories: {
          create: {
            action: "RETURN",
            fromStatus: ReimbursementStatus.SUBMITTED,
            toStatus: ReimbursementStatus.RETURNED_BY_MANAGER,
            performedById: managerId,
            notes,
          },
        },
      },
    });

    return tx.reimbursement.findUnique({
      where: { id: reimbursement.id },
      include: approvalInclude,
    });
  });
}

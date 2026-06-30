import "server-only";

import {
  ReimbursementStatus,
  UserStatus,
  WorkflowAction,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const dashboardReimbursementInclude = {
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
};

const dashboardActivityInclude = {
  performedBy: {
    select: {
      fullName: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  },
  reimbursement: {
    select: {
      id: true,
      number: true,
      status: true,
      totalAmount: true,
      requester: {
        select: {
          fullName: true,
        },
      },
    },
  },
};

export function getStartOfDay(date = new Date()) {
  const startOfDay = new Date(date);

  startOfDay.setHours(0, 0, 0, 0);

  return startOfDay;
}

export function getStartOfMonth(date = new Date()) {
  const startOfMonth = new Date(date);

  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return startOfMonth;
}

export async function countRequesterReimbursementsByStatus(requesterId: string) {
  return prisma.reimbursement.groupBy({
    by: ["status"],
    where: {
      requesterId,
    },
    _count: {
      _all: true,
    },
  });
}

export async function countRequesterReimbursements(requesterId: string) {
  return prisma.reimbursement.count({
    where: {
      requesterId,
    },
  });
}

export async function countRequesterPaidReimbursements(requesterId: string) {
  return prisma.reimbursement.count({
    where: {
      requesterId,
      paidAt: {
        not: null,
      },
    },
  });
}

export async function findRequesterRecentReimbursements(requesterId: string) {
  return prisma.reimbursement.findMany({
    where: {
      requesterId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });
}

export async function findRequesterNeedAttention(requesterId: string) {
  return prisma.reimbursement.findMany({
    where: {
      requesterId,
      status: {
        in: [
          ReimbursementStatus.DRAFT,
          ReimbursementStatus.RETURNED_BY_MANAGER,
          ReimbursementStatus.RETURNED_BY_FINANCE,
        ],
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });
}

export async function countWaitingApprovals(managerId: string) {
  return prisma.reimbursement.count({
    where: {
      status: ReimbursementStatus.SUBMITTED,
      requester: {
        managerId,
      },
    },
  });
}

export async function countManagerActivityToday(
  managerId: string,
  action: WorkflowAction,
  toStatus: ReimbursementStatus,
  startOfDay: Date,
) {
  return prisma.workflowHistory.count({
    where: {
      performedById: managerId,
      action,
      toStatus,
      createdAt: {
        gte: startOfDay,
      },
    },
  });
}

export async function findWaitingApprovalList(managerId: string) {
  return prisma.reimbursement.findMany({
    where: {
      status: ReimbursementStatus.SUBMITTED,
      requester: {
        managerId,
      },
    },
    include: dashboardReimbursementInclude,
    orderBy: {
      submittedAt: "asc",
    },
    take: 5,
  });
}

export async function findManagerRecentActivity(managerId: string) {
  return prisma.workflowHistory.findMany({
    where: {
      performedById: managerId,
      toStatus: {
        in: [
          ReimbursementStatus.APPROVED_BY_MANAGER,
          ReimbursementStatus.RETURNED_BY_MANAGER,
          ReimbursementStatus.REJECTED_BY_MANAGER,
        ],
      },
    },
    include: dashboardActivityInclude,
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });
}

export async function countWaitingVerification() {
  return prisma.reimbursement.count({
    where: {
      status: ReimbursementStatus.APPROVED_BY_MANAGER,
    },
  });
}

export async function countWaitingPayment() {
  return prisma.reimbursement.count({
    where: {
      status: ReimbursementStatus.APPROVED_BY_FINANCE,
    },
  });
}

export async function countFinanceActivityToday(
  financeUserId: string,
  action: WorkflowAction,
  toStatus: ReimbursementStatus,
  startOfDay: Date,
) {
  return prisma.workflowHistory.count({
    where: {
      performedById: financeUserId,
      action,
      toStatus,
      createdAt: {
        gte: startOfDay,
      },
    },
  });
}

export async function findWaitingVerificationList() {
  return prisma.reimbursement.findMany({
    where: {
      status: ReimbursementStatus.APPROVED_BY_MANAGER,
    },
    include: dashboardReimbursementInclude,
    orderBy: {
      updatedAt: "asc",
    },
    take: 5,
  });
}

export async function findWaitingPaymentList() {
  return prisma.reimbursement.findMany({
    where: {
      status: ReimbursementStatus.APPROVED_BY_FINANCE,
    },
    include: dashboardReimbursementInclude,
    orderBy: {
      updatedAt: "asc",
    },
    take: 5,
  });
}

export async function findFinanceRecentActivity(financeUserId: string) {
  return prisma.workflowHistory.findMany({
    where: {
      performedById: financeUserId,
      toStatus: {
        in: [
          ReimbursementStatus.APPROVED_BY_FINANCE,
          ReimbursementStatus.RETURNED_BY_FINANCE,
          ReimbursementStatus.PAID,
          ReimbursementStatus.COMPLETED,
        ],
      },
    },
    include: dashboardActivityInclude,
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });
}

export async function countAllReimbursements() {
  return prisma.reimbursement.count();
}

export async function countActiveUsers() {
  return prisma.user.count({
    where: {
      deletedAt: null,
      status: UserStatus.ACTIVE,
    },
  });
}

export async function countGlobalPendingApproval() {
  return prisma.reimbursement.count({
    where: {
      status: ReimbursementStatus.SUBMITTED,
    },
  });
}

export async function countGlobalPendingVerification() {
  return prisma.reimbursement.count({
    where: {
      status: ReimbursementStatus.APPROVED_BY_MANAGER,
    },
  });
}

export async function countPaidThisMonth(startOfMonth: Date) {
  return prisma.reimbursement.count({
    where: {
      paidAt: {
        gte: startOfMonth,
      },
    },
  });
}

export async function findRecentSystemActivity() {
  return prisma.workflowHistory.findMany({
    include: dashboardActivityInclude,
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });
}

import "server-only";

import {
  ReimbursementStatus,
  WorkflowAction,
} from "@/generated/prisma/enums";
import type { CurrentUser } from "@/types/auth";
import { AuthRole } from "@/types/auth";
import * as dashboardRepository from "@/modules/dashboard/repositories/dashboard.repository";
import type {
  AdminDashboardData,
  DashboardData,
  FinanceDashboardData,
  ManagerDashboardData,
  RequesterDashboardData,
} from "@/modules/dashboard/types";

function countStatus(
  statusCounts: Awaited<
    ReturnType<typeof dashboardRepository.countRequesterReimbursementsByStatus>
  >,
  statuses: ReimbursementStatus[],
) {
  return statusCounts
    .filter((statusCount) => statuses.includes(statusCount.status))
    .reduce((total, statusCount) => total + statusCount._count._all, 0);
}

async function getRequesterDashboard(
  user: CurrentUser,
): Promise<RequesterDashboardData> {
  const [total, statusCounts, paid, recentReimbursements, needAttention] =
    await Promise.all([
      dashboardRepository.countRequesterReimbursements(user.userId),
      dashboardRepository.countRequesterReimbursementsByStatus(user.userId),
      dashboardRepository.countRequesterPaidReimbursements(user.userId),
      dashboardRepository.findRequesterRecentReimbursements(user.userId),
      dashboardRepository.findRequesterNeedAttention(user.userId),
    ]);

  return {
    type: "requester",
    summary: {
      total,
      draft: countStatus(statusCounts, [ReimbursementStatus.DRAFT]),
      submitted: countStatus(statusCounts, [ReimbursementStatus.SUBMITTED]),
      returned: countStatus(statusCounts, [
        ReimbursementStatus.RETURNED_BY_MANAGER,
        ReimbursementStatus.RETURNED_BY_FINANCE,
      ]),
      approved: countStatus(statusCounts, [
        ReimbursementStatus.APPROVED_BY_MANAGER,
        ReimbursementStatus.APPROVED_BY_FINANCE,
      ]),
      paid,
      rejected: countStatus(statusCounts, [
        ReimbursementStatus.REJECTED_BY_MANAGER,
        ReimbursementStatus.REJECTED_BY_FINANCE,
      ]),
    },
    recentReimbursements,
    needAttention,
  };
}

async function getManagerDashboard(
  user: CurrentUser,
): Promise<ManagerDashboardData> {
  const startOfDay = dashboardRepository.getStartOfDay();
  const [
    waitingApproval,
    approvedToday,
    returnedToday,
    rejectedToday,
    waitingApprovals,
    recentActivity,
  ] = await Promise.all([
    dashboardRepository.countWaitingApprovals(user.userId),
    dashboardRepository.countManagerActivityToday(
      user.userId,
      WorkflowAction.APPROVE,
      ReimbursementStatus.APPROVED_BY_MANAGER,
      startOfDay,
    ),
    dashboardRepository.countManagerActivityToday(
      user.userId,
      WorkflowAction.RETURN,
      ReimbursementStatus.RETURNED_BY_MANAGER,
      startOfDay,
    ),
    dashboardRepository.countManagerActivityToday(
      user.userId,
      WorkflowAction.REJECT,
      ReimbursementStatus.REJECTED_BY_MANAGER,
      startOfDay,
    ),
    dashboardRepository.findWaitingApprovalList(user.userId),
    dashboardRepository.findManagerRecentActivity(user.userId),
  ]);

  return {
    type: "manager",
    summary: {
      waitingApproval,
      approvedToday,
      returnedToday,
      rejectedToday,
    },
    waitingApprovals,
    recentActivity,
  };
}

async function getFinanceDashboard(
  user: CurrentUser,
): Promise<FinanceDashboardData> {
  const startOfDay = dashboardRepository.getStartOfDay();
  const [
    waitingVerification,
    verifiedToday,
    waitingPayment,
    paidToday,
    waitingVerificationList,
    waitingPaymentList,
    recentActivity,
  ] = await Promise.all([
    dashboardRepository.countWaitingVerification(),
    dashboardRepository.countFinanceActivityToday(
      user.userId,
      WorkflowAction.APPROVE,
      ReimbursementStatus.APPROVED_BY_FINANCE,
      startOfDay,
    ),
    dashboardRepository.countWaitingPayment(),
    dashboardRepository.countFinanceActivityToday(
      user.userId,
      WorkflowAction.MARK_AS_PAID,
      ReimbursementStatus.PAID,
      startOfDay,
    ),
    dashboardRepository.findWaitingVerificationList(),
    dashboardRepository.findWaitingPaymentList(),
    dashboardRepository.findFinanceRecentActivity(user.userId),
  ]);

  return {
    type: "finance",
    summary: {
      waitingVerification,
      verifiedToday,
      waitingPayment,
      paidToday,
    },
    waitingVerificationList,
    waitingPaymentList,
    recentActivity,
  };
}

async function getAdminDashboard(): Promise<AdminDashboardData> {
  const startOfMonth = dashboardRepository.getStartOfMonth();
  const [
    totalReimbursement,
    totalUser,
    pendingApproval,
    pendingVerification,
    paidThisMonth,
    recentSystemActivity,
  ] = await Promise.all([
    dashboardRepository.countAllReimbursements(),
    dashboardRepository.countActiveUsers(),
    dashboardRepository.countGlobalPendingApproval(),
    dashboardRepository.countGlobalPendingVerification(),
    dashboardRepository.countPaidThisMonth(startOfMonth),
    dashboardRepository.findRecentSystemActivity(),
  ]);

  return {
    type: "admin",
    summary: {
      totalReimbursement,
      totalUser,
      pendingApproval,
      pendingVerification,
      paidThisMonth,
    },
    recentSystemActivity,
  };
}

export async function getDashboardData(
  user: CurrentUser,
): Promise<DashboardData> {
  if (user.role === AuthRole.ADMIN) {
    return getAdminDashboard();
  }

  if (user.role === AuthRole.MANAGER) {
    return getManagerDashboard(user);
  }

  if (user.role === AuthRole.FINANCE) {
    return getFinanceDashboard(user);
  }

  return getRequesterDashboard(user);
}

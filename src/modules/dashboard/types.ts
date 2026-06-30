import type {
  ReimbursementStatus,
  WorkflowAction,
} from "@/generated/prisma/enums";

export interface DashboardReimbursementItem {
  id: string;
  number: string;
  description: string | null;
  status: ReimbursementStatus;
  totalAmount: { toString(): string };
  submittedAt: Date | null;
  updatedAt: Date;
  requester?: {
    fullName: string;
    employeeId: string | null;
    department: {
      name: string;
    };
  };
}

export interface DashboardActivityItem {
  id: string;
  action: WorkflowAction;
  fromStatus: ReimbursementStatus | null;
  toStatus: ReimbursementStatus;
  notes: string | null;
  createdAt: Date;
  performedBy: {
    fullName: string;
    role: {
      name: string;
    };
  };
  reimbursement: {
    id: string;
    number: string;
    status: ReimbursementStatus;
    totalAmount: { toString(): string };
    requester: {
      fullName: string;
    };
  };
}

export interface RequesterDashboardData {
  type: "requester";
  summary: {
    total: number;
    draft: number;
    submitted: number;
    returned: number;
    approved: number;
    paid: number;
    rejected: number;
  };
  recentReimbursements: DashboardReimbursementItem[];
  needAttention: DashboardReimbursementItem[];
}

export interface ManagerDashboardData {
  type: "manager";
  summary: {
    waitingApproval: number;
    approvedToday: number;
    returnedToday: number;
    rejectedToday: number;
  };
  waitingApprovals: DashboardReimbursementItem[];
  recentActivity: DashboardActivityItem[];
}

export interface FinanceDashboardData {
  type: "finance";
  summary: {
    waitingVerification: number;
    verifiedToday: number;
    waitingPayment: number;
    paidToday: number;
  };
  waitingVerificationList: DashboardReimbursementItem[];
  waitingPaymentList: DashboardReimbursementItem[];
  recentActivity: DashboardActivityItem[];
}

export interface AdminDashboardData {
  type: "admin";
  summary: {
    totalReimbursement: number;
    totalUser: number;
    pendingApproval: number;
    pendingVerification: number;
    paidThisMonth: number;
  };
  recentSystemActivity: DashboardActivityItem[];
}

export type DashboardData =
  | RequesterDashboardData
  | ManagerDashboardData
  | FinanceDashboardData
  | AdminDashboardData;

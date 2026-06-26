import { ActionType, ClaimStatus } from "@/generated/prisma/enums";

export interface ReimbursementItemInput {
  category: string;
  amount: bigint;
  description?: string;
}

export interface CreateRequestInput {
  userId: string;
  userName: string;
  approverId: string;
  title: string;
  items: ReimbursementItemInput[];
  attachmentPaths: string[];
}

export interface CreateRequestResult {
  requestId: string;
  status: ClaimStatus;
  totalAmount: bigint;
}

export interface UpdateRequestStatusInput {
  requestId: string;
  currentStatus: ClaimStatus;
  nextStatus: ClaimStatus;
  actorId: string;
  actorName: string;
  notes?: string;
}

export interface HistoryLogItem {
  id: number;
  requestId: string;
  actorId: string;
  actorName: string;
  action: ActionType;
  notes: string | null;
  createdAt: Date;
}

const ALLOWED_STATUS_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  [ClaimStatus.DRAFT]: [ClaimStatus.PENDING_ATASAN],
  [ClaimStatus.PENDING_ATASAN]: [
    ClaimStatus.PENDING_FINANCE,
    ClaimStatus.REJECTED,
  ],
  [ClaimStatus.PENDING_FINANCE]: [ClaimStatus.APPROVED, ClaimStatus.REJECTED],
  [ClaimStatus.APPROVED]: [],
  [ClaimStatus.REJECTED]: [],
};

export async function createRequest(
  input: CreateRequestInput,
): Promise<CreateRequestResult> {
  // Keeping amount aggregation in BigInt makes the service contract safe before Prisma writes are connected.
  const totalAmount = input.items.reduce(
    (currentTotal, item) => currentTotal + item.amount,
    BigInt(0),
  );

  return {
    requestId: `RBM-MOCK-${Date.now()}`,
    status: ClaimStatus.DRAFT,
    totalAmount,
  };
}

export async function updateRequestStatus(
  input: UpdateRequestStatusInput,
): Promise<{ requestId: string; status: ClaimStatus }> {
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[input.currentStatus];

  if (!allowedNextStatuses.includes(input.nextStatus)) {
    throw new Error(
      `Invalid reimbursement status transition from ${input.currentStatus} to ${input.nextStatus}.`,
    );
  }

  if (input.nextStatus === ClaimStatus.REJECTED && !input.notes?.trim()) {
    throw new Error("Rejection notes are required for audit history.");
  }

  return {
    requestId: input.requestId,
    status: input.nextStatus,
  };
}

export async function getHistoryLog(
  requestId: string,
): Promise<HistoryLogItem[]> {
  void requestId;

  // The empty result keeps Phase 1 UI callable while preserving the future Prisma-only service boundary.
  return [];
}

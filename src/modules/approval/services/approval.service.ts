import "server-only";

import { ReimbursementStatus } from "@/generated/prisma/enums";
import { createPaginationMeta } from "@/lib/api";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
import * as approvalRepository from "@/modules/approval/repositories/approval.repository";
import type {
  ApprovalActionInput,
  ApprovalListParams,
} from "@/modules/approval/types";
import type { CurrentUser } from "@/types/auth";

function ensureApprovalAccess<
  TReimbursement extends {
    status: ReimbursementStatus;
    requester: { managerId: string | null };
  } | null,
>(
  reimbursement: TReimbursement,
  manager: CurrentUser,
): asserts reimbursement is NonNullable<TReimbursement> {
  if (!reimbursement) {
    throw new NotFoundError("Approval request was not found.");
  }

  if (reimbursement.requester.managerId !== manager.userId) {
    throw new AuthorizationError(
      "You can only review reimbursements from your direct reports.",
    );
  }
}

function ensureSubmittedStatus(status: ReimbursementStatus) {
  if (status !== ReimbursementStatus.SUBMITTED) {
    throw new ValidationError("Only submitted reimbursements can be reviewed.");
  }
}

export async function listWaitingApprovals(params: ApprovalListParams) {
  const [approvals, totalItems] = await Promise.all([
    approvalRepository.findWaitingApprovals(params),
    approvalRepository.countWaitingApprovals(params),
  ]);

  return {
    data: approvals,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getApprovalDetail(id: string, manager: CurrentUser) {
  const reimbursement = await approvalRepository.findApprovalDetail(id);

  ensureApprovalAccess(reimbursement, manager);

  return reimbursement;
}

export async function approveReimbursement(
  id: string,
  input: ApprovalActionInput,
  manager: CurrentUser,
) {
  const reimbursement = await getApprovalDetail(id, manager);

  ensureSubmittedStatus(reimbursement.status);

  const approvedReimbursement = await approvalRepository.approveReimbursement(
    id,
    manager.userId,
    input.notes,
  );

  await recordMutationAuditLog({
    actor: manager,
    action: AuditAction.APPROVE,
    resource: "Reimbursement",
    resourceId: id,
    description: "Manager approved reimbursement.",
    oldValues: reimbursement,
    newValues: approvedReimbursement,
    metadata: {
      notes: input.notes,
      fromStatus: reimbursement.status,
      toStatus: ReimbursementStatus.APPROVED_BY_MANAGER,
    },
  });

  return approvedReimbursement;
}

export async function rejectReimbursement(
  id: string,
  input: ApprovalActionInput,
  manager: CurrentUser,
) {
  const reimbursement = await getApprovalDetail(id, manager);

  ensureSubmittedStatus(reimbursement.status);

  const rejectedReimbursement = await approvalRepository.rejectReimbursement(
    id,
    manager.userId,
    input.notes,
  );

  await recordMutationAuditLog({
    actor: manager,
    action: AuditAction.REJECT,
    resource: "Reimbursement",
    resourceId: id,
    description: "Manager rejected reimbursement.",
    oldValues: reimbursement,
    newValues: rejectedReimbursement,
    metadata: {
      notes: input.notes,
      fromStatus: reimbursement.status,
      toStatus: ReimbursementStatus.REJECTED_BY_MANAGER,
    },
  });

  return rejectedReimbursement;
}

export async function returnReimbursement(
  id: string,
  input: ApprovalActionInput,
  manager: CurrentUser,
) {
  const reimbursement = await getApprovalDetail(id, manager);

  ensureSubmittedStatus(reimbursement.status);

  const returnedReimbursement = await approvalRepository.returnReimbursement(
    id,
    manager.userId,
    input.notes,
  );

  await recordMutationAuditLog({
    actor: manager,
    action: AuditAction.RETURN,
    resource: "Reimbursement",
    resourceId: id,
    description: "Manager returned reimbursement.",
    oldValues: reimbursement,
    newValues: returnedReimbursement,
    metadata: {
      notes: input.notes,
      fromStatus: reimbursement.status,
      toStatus: ReimbursementStatus.RETURNED_BY_MANAGER,
    },
  });

  return returnedReimbursement;
}

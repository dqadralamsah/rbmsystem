import "server-only";

import { ReimbursementStatus } from "@/generated/prisma/enums";
import { createPaginationMeta } from "@/lib/api";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
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

  return approvalRepository.approveReimbursement(id, manager.userId, input.notes);
}

export async function rejectReimbursement(
  id: string,
  input: ApprovalActionInput,
  manager: CurrentUser,
) {
  const reimbursement = await getApprovalDetail(id, manager);

  ensureSubmittedStatus(reimbursement.status);

  return approvalRepository.rejectReimbursement(id, manager.userId, input.notes);
}

export async function returnReimbursement(
  id: string,
  input: ApprovalActionInput,
  manager: CurrentUser,
) {
  const reimbursement = await getApprovalDetail(id, manager);

  ensureSubmittedStatus(reimbursement.status);

  return approvalRepository.returnReimbursement(id, manager.userId, input.notes);
}

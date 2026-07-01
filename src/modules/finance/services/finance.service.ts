import "server-only";

import { ReimbursementStatus } from "@/generated/prisma/enums";
import { createPaginationMeta } from "@/lib/api";
import {
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
import * as financeRepository from "@/modules/finance/repositories/finance.repository";
import type {
  FinanceActionInput,
  FinanceListParams,
} from "@/modules/finance/types";
import type { CurrentUser } from "@/types/auth";

function ensureFinanceStatus(
  reimbursement: { status: ReimbursementStatus } | null,
): asserts reimbursement is { status: ReimbursementStatus } {
  if (!reimbursement) {
    throw new NotFoundError("Finance request was not found.");
  }
}

export async function listFinanceQueue(params: FinanceListParams) {
  const [requests, totalItems] = await Promise.all([
    financeRepository.findFinanceQueue(params),
    financeRepository.countFinanceQueue(params),
  ]);

  return {
    data: requests,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getFinanceDetail(id: string) {
  const reimbursement = await financeRepository.findFinanceDetail(id);

  if (!reimbursement) {
    throw new NotFoundError("Finance request was not found.");
  }

  return reimbursement;
}

export async function verifyReimbursement(
  id: string,
  input: FinanceActionInput,
  financeUser: CurrentUser,
) {
  const reimbursement = await financeRepository.findFinanceDetail(id);

  ensureFinanceStatus(reimbursement);

  if (reimbursement.status !== ReimbursementStatus.APPROVED_BY_MANAGER) {
    throw new ValidationError(
      "Only manager-approved reimbursements can be verified.",
    );
  }

  const verifiedReimbursement = await financeRepository.verifyReimbursement(
    id,
    financeUser.userId,
    input.notes,
  );

  await recordMutationAuditLog({
    actor: financeUser,
    action: AuditAction.VERIFY,
    resource: "Reimbursement",
    resourceId: id,
    description: "Finance verified reimbursement.",
    oldValues: reimbursement,
    newValues: verifiedReimbursement,
    metadata: {
      notes: input.notes,
      fromStatus: reimbursement.status,
      toStatus: ReimbursementStatus.APPROVED_BY_FINANCE,
    },
  });

  return verifiedReimbursement;
}

export async function returnReimbursement(
  id: string,
  input: FinanceActionInput,
  financeUser: CurrentUser,
) {
  const reimbursement = await financeRepository.findFinanceDetail(id);

  ensureFinanceStatus(reimbursement);

  if (reimbursement.status !== ReimbursementStatus.APPROVED_BY_MANAGER) {
    throw new ValidationError(
      "Only manager-approved reimbursements can be returned by finance.",
    );
  }

  const returnedReimbursement = await financeRepository.returnReimbursement(
    id,
    financeUser.userId,
    input.notes,
  );

  await recordMutationAuditLog({
    actor: financeUser,
    action: AuditAction.RETURN,
    resource: "Reimbursement",
    resourceId: id,
    description: "Finance returned reimbursement.",
    oldValues: reimbursement,
    newValues: returnedReimbursement,
    metadata: {
      notes: input.notes,
      fromStatus: reimbursement.status,
      toStatus: ReimbursementStatus.RETURNED_BY_FINANCE,
    },
  });

  return returnedReimbursement;
}

export async function markReimbursementAsPaid(
  id: string,
  input: FinanceActionInput,
  financeUser: CurrentUser,
) {
  const reimbursement = await financeRepository.findFinanceDetail(id);

  ensureFinanceStatus(reimbursement);

  if (reimbursement.status !== ReimbursementStatus.APPROVED_BY_FINANCE) {
    throw new ValidationError(
      "Only finance-approved reimbursements can be marked as paid.",
    );
  }

  const paidAt = new Date();
  const paidReimbursement = await financeRepository.markReimbursementAsPaid(
    id,
    financeUser.userId,
    input.notes,
    paidAt,
  );

  await recordMutationAuditLog({
    actor: financeUser,
    action: AuditAction.MARK_AS_PAID,
    resource: "Reimbursement",
    resourceId: id,
    description: "Finance marked reimbursement as paid.",
    oldValues: reimbursement,
    newValues: paidReimbursement,
    metadata: {
      notes: input.notes,
      fromStatus: reimbursement.status,
      toStatus: ReimbursementStatus.COMPLETED,
      paidAt,
    },
  });

  return paidReimbursement;
}

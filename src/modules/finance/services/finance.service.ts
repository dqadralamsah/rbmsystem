import "server-only";

import { ReimbursementStatus } from "@/generated/prisma/enums";
import { createPaginationMeta } from "@/lib/api";
import {
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
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

  return financeRepository.verifyReimbursement(
    id,
    financeUser.userId,
    input.notes,
  );
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

  return financeRepository.returnReimbursement(
    id,
    financeUser.userId,
    input.notes,
  );
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

  return financeRepository.markReimbursementAsPaid(
    id,
    financeUser.userId,
    input.notes,
    new Date(),
  );
}

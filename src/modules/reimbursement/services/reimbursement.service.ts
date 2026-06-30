import "server-only";

import { Decimal } from "@prisma/client/runtime/client";
import { ReimbursementStatus } from "@/generated/prisma/enums";
import {
  createPaginationMeta,
} from "@/lib/api";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  EDITABLE_REIMBURSEMENT_STATUSES,
} from "@/modules/reimbursement/constants/reimbursement.constants";
import {
  createDraftNumber,
  generateReimbursementNumber,
} from "@/modules/reimbursement/services/reimbursement-number.service";
import * as reimbursementRepository from "@/modules/reimbursement/repositories/reimbursement.repository";
import type {
  ReimbursementListParams,
  ReimbursementMutationInput,
} from "@/modules/reimbursement/types";
import type { CurrentUser } from "@/types/auth";

function calculateTotalAmount(input: ReimbursementMutationInput): string {
  return input.items
    .reduce((total, item) => total.plus(new Decimal(item.amount)), new Decimal(0))
    .toFixed(2);
}

async function validateCategories(input: ReimbursementMutationInput) {
  const categoryIds = [...new Set(input.items.map((item) => item.categoryId))];
  const activeCategories =
    await reimbursementRepository.findActiveCategoryIds(categoryIds);

  if (activeCategories.length !== categoryIds.length) {
    throw new ValidationError("One or more reimbursement categories are invalid.");
  }
}

function ensureRequesterOwnership<TReimbursement extends { requesterId: string } | null>(
  reimbursement: TReimbursement,
  user: CurrentUser,
): asserts reimbursement is NonNullable<TReimbursement> {
  if (!reimbursement) {
    throw new NotFoundError("Reimbursement was not found.");
  }

  if (reimbursement.requesterId !== user.userId) {
    throw new AuthorizationError(
      "You do not have access to this reimbursement.",
    );
  }
}

function ensureDraftStatus(status: ReimbursementStatus) {
  if (!EDITABLE_REIMBURSEMENT_STATUSES.some((draftStatus) => draftStatus === status)) {
    throw new ValidationError(
      "Only draft or returned reimbursements can be changed.",
    );
  }
}

function getSubmitTargetStatus(status: ReimbursementStatus) {
  if (status === ReimbursementStatus.DRAFT) {
    return ReimbursementStatus.SUBMITTED;
  }

  if (status === ReimbursementStatus.RETURNED_BY_MANAGER) {
    return ReimbursementStatus.SUBMITTED;
  }

  if (status === ReimbursementStatus.RETURNED_BY_FINANCE) {
    return ReimbursementStatus.APPROVED_BY_MANAGER;
  }

  throw new ValidationError(
    "Only draft or returned reimbursements can be submitted.",
  );
}

export async function listMyReimbursements(params: ReimbursementListParams) {
  const [reimbursements, totalItems] = await Promise.all([
    reimbursementRepository.findMyReimbursements(params),
    reimbursementRepository.countMyReimbursements(params),
  ]);

  return {
    data: reimbursements,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getMyReimbursement(id: string, user: CurrentUser) {
  const reimbursement = await reimbursementRepository.findReimbursementById(id);

  ensureRequesterOwnership(reimbursement, user);

  return reimbursement;
}

export async function listActiveReimbursementCategories() {
  return reimbursementRepository.findActiveCategories();
}

export async function createDraftReimbursement(
  input: ReimbursementMutationInput,
  user: CurrentUser,
) {
  await validateCategories(input);

  const totalAmount = calculateTotalAmount(input);
  const reimbursement =
    await reimbursementRepository.createDraftReimbursement(
      user.userId,
      createDraftNumber(),
      totalAmount,
      input,
    );

  if (!reimbursement) {
    throw new NotFoundError("Reimbursement was not found.");
  }

  return reimbursement;
}

export async function updateDraftReimbursement(
  id: string,
  input: ReimbursementMutationInput,
  user: CurrentUser,
) {
  const reimbursement = await getMyReimbursement(id, user);

  ensureDraftStatus(reimbursement.status);
  await validateCategories(input);

  const totalAmount = calculateTotalAmount(input);
  const updatedReimbursement =
    await reimbursementRepository.replaceDraftReimbursementItems(
      id,
      user.userId,
      totalAmount,
      input,
    );

  if (!updatedReimbursement) {
    throw new NotFoundError("Reimbursement was not found.");
  }

  return updatedReimbursement;
}

export async function deleteDraftReimbursement(id: string, user: CurrentUser) {
  const reimbursement = await getMyReimbursement(id, user);

  ensureDraftStatus(reimbursement.status);
  await reimbursementRepository.deleteDraftReimbursement(id);
}

export async function submitDraftReimbursement(id: string, user: CurrentUser) {
  const reimbursement = await getMyReimbursement(id, user);

  const toStatus = getSubmitTargetStatus(reimbursement.status);

  if (reimbursement.items.length === 0) {
    throw new ValidationError("At least one reimbursement item is required.");
  }

  const submittedAt = new Date();
  const shouldGenerateNumber = reimbursement.status === ReimbursementStatus.DRAFT;
  const submittedReimbursement =
    await reimbursementRepository.submitDraftReimbursement(
      id,
      user.userId,
      reimbursement.status,
      toStatus,
      submittedAt,
      shouldGenerateNumber
        ? (tx) => generateReimbursementNumber(submittedAt, tx)
        : undefined,
    );

  if (!submittedReimbursement) {
    throw new NotFoundError("Reimbursement was not found.");
  }

  return submittedReimbursement;
}

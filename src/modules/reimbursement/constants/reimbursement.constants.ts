import { ReimbursementStatus } from "@/generated/prisma/enums";

export const REIMBURSEMENT_PERMISSIONS = {
  create: "reimbursement.create",
  update: "reimbursement.update",
  submit: "reimbursement.submit",
} as const;

export const EDITABLE_REIMBURSEMENT_STATUSES = [
  ReimbursementStatus.DRAFT,
  ReimbursementStatus.RETURNED_BY_MANAGER,
  ReimbursementStatus.RETURNED_BY_FINANCE,
] as const;

export const DRAFT_NUMBER_PREFIX = "DRAFT-";

import "server-only";

import { randomUUID } from "node:crypto";

import { DRAFT_NUMBER_PREFIX } from "@/modules/reimbursement/constants/reimbursement.constants";
import {
  findLatestOfficialNumberByPrefix,
  type ReimbursementDatabaseClient,
} from "@/modules/reimbursement/repositories/reimbursement.repository";

function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");

  return `${year}${month}`;
}

function parseSequence(number: string | undefined): number {
  if (!number) {
    return 0;
  }

  const sequence = Number(number.slice(-4));

  return Number.isInteger(sequence) ? sequence : 0;
}

export function createDraftNumber(): string {
  return `${DRAFT_NUMBER_PREFIX}${randomUUID()}`;
}

export async function generateReimbursementNumber(
  date: Date,
  tx?: ReimbursementDatabaseClient,
) {
  const prefix = `RBM-${formatYearMonth(date)}-`;
  const latest = await findLatestOfficialNumberByPrefix(prefix, tx);
  const nextSequence = parseSequence(latest?.number) + 1;

  return `${prefix}${`${nextSequence}`.padStart(4, "0")}`;
}

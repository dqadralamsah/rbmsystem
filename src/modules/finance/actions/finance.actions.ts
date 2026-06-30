"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import {
  markReimbursementAsPaid,
  returnReimbursement,
  verifyReimbursement,
} from "@/modules/finance/services/finance.service";
import { financeActionSchema } from "@/modules/finance/validation/finance.validation";

const FINANCE_LIST_PATH = "/dashboard/finance";

function parseActionFormData(formData: FormData) {
  const id = formData.get("id");
  const result = financeActionSchema.safeParse({
    notes: formData.get("notes"),
  });

  if (typeof id !== "string" || id.trim().length === 0) {
    throw new ValidationError("Reimbursement ID is required.");
  }

  if (!result.success) {
    throw new ValidationError(
      "Finance action validation failed.",
      result.error.flatten(),
    );
  }

  return {
    id,
    input: result.data,
  };
}

export async function verifyReimbursementAction(formData: FormData) {
  const user = await requirePermission("finance.approve");
  const { id, input } = parseActionFormData(formData);

  await verifyReimbursement(id, input, user);
  revalidatePath(FINANCE_LIST_PATH);
  redirect(`${FINANCE_LIST_PATH}/${id}`);
}

export async function markReimbursementAsPaidAction(formData: FormData) {
  const user = await requirePermission("finance.mark_paid");
  const { id, input } = parseActionFormData(formData);

  await markReimbursementAsPaid(id, input, user);
  revalidatePath(FINANCE_LIST_PATH);
  redirect(`${FINANCE_LIST_PATH}/${id}`);
}

export async function returnReimbursementAction(formData: FormData) {
  const user = await requirePermission("finance.return");
  const { id, input } = parseActionFormData(formData);

  await returnReimbursement(id, input, user);
  revalidatePath(FINANCE_LIST_PATH);
  redirect(`${FINANCE_LIST_PATH}/${id}`);
}

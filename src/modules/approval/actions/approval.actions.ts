"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import {
  approvalActionSchema,
} from "@/modules/approval/validation/approval.validation";
import {
  approveReimbursement,
  rejectReimbursement,
  returnReimbursement,
} from "@/modules/approval/services/approval.service";

const APPROVAL_LIST_PATH = "/dashboard/approval";

function parseActionFormData(formData: FormData) {
  const id = formData.get("id");
  const result = approvalActionSchema.safeParse({
    notes: formData.get("notes"),
  });

  if (typeof id !== "string" || id.trim().length === 0) {
    throw new ValidationError("Reimbursement ID is required.");
  }

  if (!result.success) {
    throw new ValidationError(
      "Approval action validation failed.",
      result.error.flatten(),
    );
  }

  return {
    id,
    input: result.data,
  };
}

export async function approveReimbursementAction(formData: FormData) {
  const user = await requirePermission("approval.approve");
  const { id, input } = parseActionFormData(formData);

  await approveReimbursement(id, input, user);
  revalidatePath(APPROVAL_LIST_PATH);
  redirect(`${APPROVAL_LIST_PATH}/${id}`);
}

export async function rejectReimbursementAction(formData: FormData) {
  const user = await requirePermission("approval.reject");
  const { id, input } = parseActionFormData(formData);

  await rejectReimbursement(id, input, user);
  revalidatePath(APPROVAL_LIST_PATH);
  redirect(`${APPROVAL_LIST_PATH}/${id}`);
}

export async function returnReimbursementAction(formData: FormData) {
  const user = await requirePermission("approval.return");
  const { id, input } = parseActionFormData(formData);

  await returnReimbursement(id, input, user);
  revalidatePath(APPROVAL_LIST_PATH);
  redirect(`${APPROVAL_LIST_PATH}/${id}`);
}

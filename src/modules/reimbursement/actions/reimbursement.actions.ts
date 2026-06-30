"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth";
import { AppError, ValidationError } from "@/lib/errors";
import {
  REIMBURSEMENT_PERMISSIONS,
  createDraftReimbursement,
  deleteDraftReimbursement,
  reimbursementMutationSchema,
  submitDraftReimbursement,
  updateDraftReimbursement,
} from "@/modules/reimbursement";
import type {
  ReimbursementFormState,
  ReimbursementMutationInput,
} from "@/modules/reimbursement/types";

const REIMBURSEMENT_LIST_PATH = "/dashboard/reimbursement";

function normalizeFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parseReimbursementFormData(formData: FormData) {
  const categoryIds = formData.getAll("categoryId");
  const descriptions = formData.getAll("itemDescription");
  const amounts = formData.getAll("amount");
  const maxItemLength = Math.max(
    categoryIds.length,
    descriptions.length,
    amounts.length,
  );

  const items: ReimbursementMutationInput["items"] = [];

  for (let index = 0; index < maxItemLength; index += 1) {
    const categoryId = normalizeFormValue(categoryIds[index] ?? null);
    const description = normalizeFormValue(descriptions[index] ?? null);
    const amount = normalizeFormValue(amounts[index] ?? null);

    if (!categoryId && !description && !amount) {
      continue;
    }

    items.push({
      categoryId: categoryId ?? "",
      description: description ?? "",
      amount: amount ?? "",
    });
  }

  const result = reimbursementMutationSchema.safeParse({
    description: normalizeFormValue(formData.get("description")) ?? null,
    items,
  });

  if (!result.success) {
    throw new ValidationError(
      "Reimbursement form validation failed.",
      result.error.flatten(),
    );
  }

  return result.data;
}

function getIdFromFormData(formData: FormData) {
  const id = normalizeFormValue(formData.get("id"));

  if (!id) {
    throw new ValidationError("Reimbursement ID is required.");
  }

  return id;
}

function toActionState(error: unknown): ReimbursementFormState {
  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: false,
    message: "Something went wrong. Please try again.",
  };
}

export async function createDraftAction(
  _state: ReimbursementFormState,
  formData: FormData,
): Promise<ReimbursementFormState> {
  let reimbursementId: string;

  try {
    const user = await requirePermission(REIMBURSEMENT_PERMISSIONS.create);
    const payload = parseReimbursementFormData(formData);
    const reimbursement = await createDraftReimbursement(payload, user);

    reimbursementId = reimbursement.id;
  } catch (error) {
    return toActionState(error);
  }

  revalidatePath(REIMBURSEMENT_LIST_PATH);
  redirect(`${REIMBURSEMENT_LIST_PATH}/${reimbursementId}/edit`);
}

export async function createAndSubmitAction(
  _state: ReimbursementFormState,
  formData: FormData,
): Promise<ReimbursementFormState> {
  let reimbursementId: string;

  try {
    const user = await requirePermission([
      REIMBURSEMENT_PERMISSIONS.create,
      REIMBURSEMENT_PERMISSIONS.submit,
    ]);
    const payload = parseReimbursementFormData(formData);
    const draft = await createDraftReimbursement(payload, user);
    const submitted = await submitDraftReimbursement(draft.id, user);

    reimbursementId = submitted.id;
  } catch (error) {
    return toActionState(error);
  }

  revalidatePath(REIMBURSEMENT_LIST_PATH);
  redirect(`${REIMBURSEMENT_LIST_PATH}/${reimbursementId}`);
}

export async function updateDraftAction(
  _state: ReimbursementFormState,
  formData: FormData,
): Promise<ReimbursementFormState> {
  let reimbursementId: string;

  try {
    const user = await requirePermission(REIMBURSEMENT_PERMISSIONS.update);
    reimbursementId = getIdFromFormData(formData);
    const payload = parseReimbursementFormData(formData);

    await updateDraftReimbursement(reimbursementId, payload, user);
  } catch (error) {
    return toActionState(error);
  }

  revalidatePath(REIMBURSEMENT_LIST_PATH);
  redirect(`${REIMBURSEMENT_LIST_PATH}/${reimbursementId}/edit`);
}

export async function updateAndSubmitAction(
  _state: ReimbursementFormState,
  formData: FormData,
): Promise<ReimbursementFormState> {
  let reimbursementId: string;

  try {
    const user = await requirePermission([
      REIMBURSEMENT_PERMISSIONS.update,
      REIMBURSEMENT_PERMISSIONS.submit,
    ]);
    reimbursementId = getIdFromFormData(formData);
    const payload = parseReimbursementFormData(formData);

    await updateDraftReimbursement(reimbursementId, payload, user);
    await submitDraftReimbursement(reimbursementId, user);
  } catch (error) {
    return toActionState(error);
  }

  revalidatePath(REIMBURSEMENT_LIST_PATH);
  redirect(`${REIMBURSEMENT_LIST_PATH}/${reimbursementId}`);
}

export async function submitDraftAction(formData: FormData) {
  const user = await requirePermission(REIMBURSEMENT_PERMISSIONS.submit);
  const reimbursementId = getIdFromFormData(formData);

  await submitDraftReimbursement(reimbursementId, user);
  revalidatePath(REIMBURSEMENT_LIST_PATH);
  redirect(`${REIMBURSEMENT_LIST_PATH}/${reimbursementId}`);
}

export async function deleteDraftAction(formData: FormData) {
  const user = await requirePermission(REIMBURSEMENT_PERMISSIONS.update);
  const reimbursementId = getIdFromFormData(formData);

  await deleteDraftReimbursement(reimbursementId, user);
  revalidatePath(REIMBURSEMENT_LIST_PATH);
  redirect(REIMBURSEMENT_LIST_PATH);
}

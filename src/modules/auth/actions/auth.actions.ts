"use server";

import { redirect } from "next/navigation";

import {
  clearAuthSession,
  setAuthSession,
} from "@/lib/auth";
import { createDevelopmentSession } from "@/modules/auth/services/auth.service";
import { developmentLoginSchema } from "@/modules/auth/validation/auth.validation";

export async function loginWithDevelopmentUser(formData: FormData) {
  const validatedFields = developmentLoginSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    throw new Error("Please select a valid user.");
  }

  const session = await createDevelopmentSession(validatedFields.data.userId);

  await setAuthSession(session);
  redirect("/dashboard");
}

export async function logout() {
  await clearAuthSession();
  redirect("/");
}

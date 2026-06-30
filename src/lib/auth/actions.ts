"use server";

import { redirect } from "next/navigation";

import { createDevelopmentSession } from "@/lib/auth/development-auth";
import { clearAuthSession, setAuthSession } from "@/lib/auth/session";
import { developmentLoginSchema } from "@/lib/auth/validation";

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

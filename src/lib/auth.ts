import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE,
} from "@/modules/auth/constants";
import { findActiveUserSessionById } from "@/modules/auth/repositories/auth.repository";
import { hasPermissionCode } from "@/modules/auth/services/authorization.service";
import type { AuthSession, CurrentUser } from "@/modules/auth/types";
import { authSessionSchema } from "@/modules/auth/validation/auth.validation";

function parseAuthSession(value: string | undefined): AuthSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(decodeURIComponent(value));
    const result = authSessionSchema.safeParse(parsedValue);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();

  return parseAuthSession(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}

export async function setAuthSession(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_SESSION_COOKIE,
    encodeURIComponent(JSON.stringify(session)),
    {
      httpOnly: true,
      maxAge: AUTH_SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  return findActiveUserSessionById(session.userId);
});

export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return user;
}

export async function requirePermission(
  permission: string | string[],
): Promise<CurrentUser> {
  const user = await requireAuth();

  if (!hasPermissionCode(user.permissions, permission)) {
    throw new Error("Forbidden");
  }

  return user;
}

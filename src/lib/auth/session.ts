import "server-only";

import { cookies } from "next/headers";

import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE,
} from "@/lib/auth/constants";
import type { AuthSession } from "@/types/auth";
import { authSessionSchema } from "@/lib/auth/validation";

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

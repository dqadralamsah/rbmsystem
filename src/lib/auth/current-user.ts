import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { hasPermissionCode } from "@/lib/auth/authorization";
import { findActiveUserSessionById } from "@/lib/auth/repository";
import { getAuthSession } from "@/lib/auth/session";
import { AuthorizationError } from "@/lib/errors";
import type { CurrentUser } from "@/types/auth";

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
    throw new AuthorizationError();
  }

  return user;
}

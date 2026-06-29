import "server-only";

import {
  findActiveUserSessionById,
  findActiveUsersForDevelopmentLogin,
} from "@/modules/auth/repositories/auth.repository";
import type { AuthSession, DevelopmentLoginUser } from "@/modules/auth/types";

export function isDevelopmentAuthenticationEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export async function listDevelopmentLoginUsers(): Promise<
  DevelopmentLoginUser[]
> {
  if (!isDevelopmentAuthenticationEnabled()) {
    return [];
  }

  return findActiveUsersForDevelopmentLogin();
}

export async function createDevelopmentSession(
  userId: string,
): Promise<AuthSession> {
  if (!isDevelopmentAuthenticationEnabled()) {
    throw new Error("Development authentication is disabled.");
  }

  const user = await findActiveUserSessionById(userId);

  if (!user) {
    throw new Error("Selected user is not available for login.");
  }

  return {
    userId: user.userId,
    employeeId: user.employeeId,
    fullName: user.fullName,
    role: user.role,
    departmentId: user.departmentId,
  };
}

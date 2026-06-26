import "server-only";

import { cookies } from "next/headers";

export type AuthRole = "REQUESTER" | "MANAGER" | "FINANCE";

export interface AuthSession {
  userId: string;
  userName: string;
  role: AuthRole;
  approverId: string;
  approverName: string;
}

export const AUTH_SESSION_COOKIE = "rbm_mock_session";

const MOCK_SESSIONS: Record<AuthRole, AuthSession> = {
  REQUESTER: {
    userId: "EMP-001",
    userName: "Ayu Pemohon",
    role: "REQUESTER",
    approverId: "MGR-001",
    approverName: "Bima Atasan",
  },
  MANAGER: {
    userId: "MGR-001",
    userName: "Bima Atasan",
    role: "MANAGER",
    approverId: "FIN-001",
    approverName: "Citra Finance",
  },
  FINANCE: {
    userId: "FIN-001",
    userName: "Citra Finance",
    role: "FINANCE",
    approverId: "FIN-LEAD-001",
    approverName: "Dewi Finance Lead",
  },
};

function isAuthRole(value: FormDataEntryValue | string | null): value is AuthRole {
  return value === "REQUESTER" || value === "MANAGER" || value === "FINANCE";
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<AuthSession>;

  return (
    typeof session.userId === "string" &&
    typeof session.userName === "string" &&
    isAuthRole(session.role ?? null) &&
    typeof session.approverId === "string" &&
    typeof session.approverName === "string"
  );
}

export function createMockSession(role: AuthRole): AuthSession {
  return MOCK_SESSIONS[role];
}

export function parseAuthRole(value: FormDataEntryValue | null): AuthRole {
  if (!isAuthRole(value)) {
    throw new Error("Invalid login role selected.");
  }

  return value;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(decodeURIComponent(rawSession));
    return isAuthSession(session) ? session : null;
  } catch {
    return null;
  }
}

export async function setMockAuthSession(role: AuthRole): Promise<AuthSession> {
  const session = createMockSession(role);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_SESSION_COOKIE, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return session;
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE);
}

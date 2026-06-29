import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAuth();

  return <AppShell user={user}>{children}</AppShell>;
}

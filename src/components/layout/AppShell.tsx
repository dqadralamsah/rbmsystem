import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import type { CurrentUser } from "@/modules/auth/types";

interface AppShellProps {
  children: ReactNode;
  user: CurrentUser;
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/30 md:grid md:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar permissions={user.permissions} />
      <div className="flex min-h-screen min-w-0 flex-col">
        <Header user={user} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

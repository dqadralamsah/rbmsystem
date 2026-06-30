"use client";

import { Bell, CaretDown, SignOut, UserCircle } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

import { Breadcrumb, getPageTitle } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import type { CurrentUser } from "@/types/auth";

interface HeaderProps {
  user: CurrentUser;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground">
            {pageTitle}
          </h1>
          <div className="mt-1">
            <Breadcrumb />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            aria-label="Notifications"
            className="size-10 px-0"
            type="button"
            variant="outline"
          >
            <Bell className="size-4" weight="bold" />
          </Button>

          <details className="group relative">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent">
              <UserCircle className="size-5 text-muted-foreground" weight="duotone" />
              <span className="hidden max-w-36 truncate sm:inline">
                {user.fullName}
              </span>
              <CaretDown className="size-3 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 mt-2 w-64 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
              <div className="border-b px-2 py-2">
                <p className="truncate text-sm font-medium">{user.fullName}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {user.role} - {user.departmentName}
                </p>
              </div>

              <form action={logout} className="pt-2">
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                  <SignOut className="size-4" weight="bold" />
                  Logout
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

"use client";

import {
  ChartPieSlice,
  ClipboardText,
  CurrencyCircleDollar,
  GearSix,
  House,
  ListMagnifyingGlass,
  SealCheck,
  Table,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { hasPermissionCode } from "@/lib/auth/authorization";
import { NAVIGATION_PERMISSION_REQUIREMENTS } from "@/lib/auth/constants";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: House,
    permission: NAVIGATION_PERMISSION_REQUIREMENTS.dashboard,
  },
  {
    href: "/dashboard/reimbursement",
    label: "Reimbursement",
    icon: ClipboardText,
    permission: NAVIGATION_PERMISSION_REQUIREMENTS.reimbursement,
  },
  {
    href: "/dashboard/approval",
    label: "Approval",
    icon: SealCheck,
    permission: NAVIGATION_PERMISSION_REQUIREMENTS.approval,
  },
  {
    href: "/dashboard/finance",
    label: "Finance",
    icon: CurrencyCircleDollar,
    permission: NAVIGATION_PERMISSION_REQUIREMENTS.finance,
  },
  {
    href: "/dashboard/master-data",
    label: "Master Data",
    icon: Table,
    permission: NAVIGATION_PERMISSION_REQUIREMENTS.masterData,
  },
  {
    href: "/dashboard/audit-logs",
    label: "Audit Logs",
    icon: ListMagnifyingGlass,
    permission: NAVIGATION_PERMISSION_REQUIREMENTS.masterData,
    superAdminOnly: true,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: GearSix,
    permission: NAVIGATION_PERMISSION_REQUIREMENTS.settings,
  },
] as const;

interface SidebarProps {
  isSuperAdmin: boolean;
  permissions: string[];
}

function isNavigationActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ isSuperAdmin, permissions }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = navigationItems.filter((item) => {
    if ("superAdminOnly" in item && item.superAdminOnly && !isSuperAdmin) {
      return false;
    }

    return hasPermissionCode(permissions, item.permission);
  });

  return (
    <aside className="border-b bg-background md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ChartPieSlice className="size-5" weight="duotone" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">RBM System</p>
            <p className="truncate text-xs text-muted-foreground">
              Reimbursement
            </p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:overflow-visible">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationActive(pathname, item.href);

            return (
              <Link
                className={cn(
                  "flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" weight={isActive ? "bold" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

"use client";

import {
  ChartPieSlice,
  ClipboardText,
  GearSix,
  House,
  SealCheck,
  Table,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { DASHBOARD_PERMISSION_CODES } from "@/modules/auth/constants";
import { hasPermissionCode } from "@/modules/auth/services/authorization.service";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: House,
    permission: DASHBOARD_PERMISSION_CODES.dashboard,
  },
  {
    href: "/dashboard/reimbursement",
    label: "Reimbursement",
    icon: ClipboardText,
    permission: DASHBOARD_PERMISSION_CODES.reimbursement,
  },
  {
    href: "/dashboard/approval",
    label: "Approval",
    icon: SealCheck,
    permission: DASHBOARD_PERMISSION_CODES.approval,
  },
  {
    href: "/dashboard/master-data",
    label: "Master Data",
    icon: Table,
    permission: DASHBOARD_PERMISSION_CODES.masterData,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: GearSix,
    permission: DASHBOARD_PERMISSION_CODES.settings,
  },
] as const;

interface SidebarProps {
  permissions: string[];
}

function isNavigationActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ permissions }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = navigationItems.filter((item) =>
    hasPermissionCode(permissions, item.permission),
  );

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

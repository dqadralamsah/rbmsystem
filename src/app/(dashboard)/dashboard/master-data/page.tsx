import { FolderSimple, ShieldCheck, Users, Tag } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth";

const masterDataItems = [
  {
    href: "/dashboard/master-data/departments",
    title: "Departments",
    description: "Company department master data.",
    icon: FolderSimple,
  },
  {
    href: "/dashboard/master-data/employees",
    title: "Users",
    description: "Employee accounts for SSO mapping.",
    icon: Users,
  },
  {
    href: "/dashboard/master-data/expense-categories",
    title: "Expense Categories",
    description: "Reimbursement claim categories.",
    icon: Tag,
  },
  {
    href: "/dashboard/master-data/roles",
    title: "Roles & Permissions",
    description: "RBAC roles and permission matrix.",
    icon: ShieldCheck,
  },
] as const;

export default async function MasterDataPage() {
  await requirePermission([
    "master.department",
    "master.user",
    "master.category",
    "master.role",
  ]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Master Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage company reference data used by reimbursement workflows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {masterDataItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link href={item.href} key={item.href}>
              <Card className="rounded-md transition-colors hover:bg-accent">
                <CardContent className="flex gap-4 p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="size-5" weight="duotone" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

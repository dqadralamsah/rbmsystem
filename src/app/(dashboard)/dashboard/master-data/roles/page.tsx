import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requirePermission } from "@/lib/auth";
import { createRoleAction } from "@/modules/master-data/actions/master-data.actions";
import { listRoles } from "@/modules/master-data/roles";

interface RolesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  await requirePermission("master.role");
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstParam(resolvedSearchParams.search);
  const roles = await listRoles({
    search,
    pagination: { page: 1, pageSize: 50 },
  });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Roles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Application roles for RBAC. Built-in roles cannot be edited.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Create Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRoleAction} className="grid gap-3 md:grid-cols-[240px_1fr_120px]">
            <Input name="name" placeholder="Role name" required />
            <Textarea className="min-h-10" name="description" placeholder="Description" />
            <button className={buttonVariants()} type="submit">Create</button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Role List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_120px]">
            <Input defaultValue={search ?? ""} name="search" placeholder="Search role" />
            <button className={buttonVariants({ variant: "outline" })}>Search</button>
          </form>

          <div className="divide-y rounded-md border">
            {roles.data.map((role) => (
              <div className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_120px_240px] md:items-center" key={role.id}>
                <div>
                  <p className="text-sm font-medium">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{role.description ?? "-"}</p>
                </div>
                <span className="text-xs text-muted-foreground">{role._count.users} user(s)</span>
                <div className="flex gap-2 md:justify-end">
                  <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/dashboard/master-data/role-permissions/${role.id}`}>
                    Permissions
                  </Link>
                  <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/dashboard/master-data/roles/${role.id}/edit`}>
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard/master-data/permissions">
            View Permission Catalog
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requirePermission } from "@/lib/auth";
import {
  createDepartmentAction,
  deleteDepartmentAction,
} from "@/modules/master-data/actions/master-data.actions";
import { listDepartments } from "@/modules/master-data/departments";

interface DepartmentsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DepartmentsPage({
  searchParams,
}: DepartmentsPageProps) {
  await requirePermission("master.department");
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstParam(resolvedSearchParams.search);
  const status = firstParam(resolvedSearchParams.status) as
    | "active"
    | "deleted"
    | "all"
    | undefined;
  const departments = await listDepartments({
    search,
    status,
    pagination: { page: 1, pageSize: 50 },
  });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Departments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Schema-compatible fields: code and name.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Create Department</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDepartmentAction} className="grid gap-3 md:grid-cols-[180px_1fr_120px]">
            <Input name="code" placeholder="Code" required />
            <Input name="name" placeholder="Name" required />
            <button className={buttonVariants()} type="submit">Create</button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Department List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_180px_120px]">
            <Input defaultValue={search ?? ""} name="search" placeholder="Search code or name" />
            <Select defaultValue={status ?? "active"} name="status">
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
              <option value="all">All</option>
            </Select>
            <button className={buttonVariants({ variant: "outline" })}>Search</button>
          </form>

          {departments.data.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No department found.
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {departments.data.map((department) => (
                <div className="grid gap-3 px-4 py-3 md:grid-cols-[160px_1fr_100px_180px] md:items-center" key={department.id}>
                  <span className="text-sm font-medium">{department.code}</span>
                  <span className="text-sm">{department.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {department.deletedAt ? "Deleted" : "Active"}
                  </span>
                  <div className="flex gap-2 md:justify-end">
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/dashboard/master-data/departments/${department.id}/edit`}>
                      Edit
                    </Link>
                    {!department.deletedAt ? (
                      <form action={deleteDepartmentAction}>
                        <input name="id" type="hidden" value={department.id} />
                        <button className={buttonVariants({ size: "sm", variant: "outline" })} type="submit">
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

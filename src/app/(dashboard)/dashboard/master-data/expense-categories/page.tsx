import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requirePermission } from "@/lib/auth";
import {
  createExpenseCategoryAction,
  deleteExpenseCategoryAction,
} from "@/modules/master-data/actions/master-data.actions";
import { listExpenseCategories } from "@/modules/master-data/expense-categories";

interface ExpenseCategoriesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExpenseCategoriesPage({
  searchParams,
}: ExpenseCategoriesPageProps) {
  await requirePermission("master.category");
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstParam(resolvedSearchParams.search);
  const status = firstParam(resolvedSearchParams.status) as
    | "active"
    | "deleted"
    | "all"
    | undefined;
  const isActiveParam = firstParam(resolvedSearchParams.isActive);
  const isActive =
    isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;
  const categories = await listExpenseCategories({
    search,
    status,
    isActive,
    pagination: { page: 1, pageSize: 50 },
  });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Expense Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Categories available for reimbursement items.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Create Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createExpenseCategoryAction} className="grid gap-3 md:grid-cols-[180px_1fr_120px]">
            <Input name="code" placeholder="Code" required />
            <Input name="name" placeholder="Name" required />
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked name="isActive" type="checkbox" />
              Active
            </label>
            <Textarea className="md:col-span-3" name="description" placeholder="Description" />
            <button className={buttonVariants()} type="submit">Create</button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Category List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_160px_160px_120px]">
            <Input defaultValue={search ?? ""} name="search" placeholder="Search code, name, description" />
            <Select defaultValue={typeof isActive === "boolean" ? `${isActive}` : ""} name="isActive">
              <option value="">All active states</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <Select defaultValue={status ?? "active"} name="status">
              <option value="active">Not deleted</option>
              <option value="deleted">Deleted</option>
              <option value="all">All</option>
            </Select>
            <button className={buttonVariants({ variant: "outline" })}>Search</button>
          </form>

          {categories.data.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No category found.
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {categories.data.map((category) => (
                <div className="grid gap-3 px-4 py-3 md:grid-cols-[160px_1fr_100px_180px] md:items-center" key={category.id}>
                  <span className="text-sm font-medium">{category.code}</span>
                  <div>
                    <p className="text-sm">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.description ?? "-"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                  <div className="flex gap-2 md:justify-end">
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/dashboard/master-data/expense-categories/${category.id}/edit`}>
                      Edit
                    </Link>
                    {!category.deletedAt ? (
                      <form action={deleteExpenseCategoryAction}>
                        <input name="id" type="hidden" value={category.id} />
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

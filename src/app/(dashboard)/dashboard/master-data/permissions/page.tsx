import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth";
import { listPermissions } from "@/modules/master-data/permissions";

interface PermissionsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PermissionsPage({
  searchParams,
}: PermissionsPageProps) {
  await requirePermission("master.role");
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstParam(resolvedSearchParams.search);
  const permissions = await listPermissions({
    search,
    pagination: { page: 1, pageSize: 100 },
  });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Permission Catalog</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only permissions seeded by the application.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_120px]">
            <Input defaultValue={search ?? ""} name="search" placeholder="Search permission" />
            <button className={buttonVariants({ variant: "outline" })}>Search</button>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {permissions.data.map((permission) => (
              <div className="rounded-md border px-4 py-3" key={permission.id}>
                <p className="text-sm font-medium">{permission.code}</p>
                <p className="mt-1 text-xs text-muted-foreground">{permission.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

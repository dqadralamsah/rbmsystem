import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth";
import { updateRolePermissionsAction } from "@/modules/master-data/actions/master-data.actions";
import { getRolePermissionMatrix } from "@/modules/master-data/role-permissions";

interface RolePermissionsPageProps {
  params: Promise<{ roleId: string }>;
}

export default async function RolePermissionsPage({
  params,
}: RolePermissionsPageProps) {
  await requirePermission("master.role");
  const { roleId } = await params;
  const matrix = await getRolePermissionMatrix(roleId);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Role Permission Matrix</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update permission mapping for {matrix.role.name}.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">{matrix.role.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateRolePermissionsAction} className="space-y-5">
            <input name="roleId" type="hidden" value={matrix.role.id} />
            <div className="grid gap-3 md:grid-cols-2">
              {matrix.permissions.map((permission) => (
                <label className="flex items-start gap-3 rounded-md border px-4 py-3 text-sm" key={permission.id}>
                  <input
                    defaultChecked={permission.assigned}
                    name="permissionIds"
                    type="checkbox"
                    value={permission.id}
                  />
                  <span>
                    <span className="block font-medium">{permission.code}</span>
                    <span className="block text-xs text-muted-foreground">
                      {permission.name}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <button className={buttonVariants()} type="submit">Save Permissions</button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

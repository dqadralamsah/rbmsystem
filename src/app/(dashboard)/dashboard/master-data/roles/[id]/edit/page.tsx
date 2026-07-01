import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requirePermission } from "@/lib/auth";
import { updateRoleAction } from "@/modules/master-data/actions/master-data.actions";
import { getRole } from "@/modules/master-data/roles";

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  await requirePermission("master.role");
  const { id } = await params;
  const role = await getRole(id);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Edit Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateRoleAction} className="space-y-3">
            <input name="id" type="hidden" value={role.id} />
            <Input defaultValue={role.name} name="name" placeholder="Role name" required />
            <Textarea defaultValue={role.description ?? ""} name="description" placeholder="Description" />
            <button className={buttonVariants()} type="submit">Save</button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

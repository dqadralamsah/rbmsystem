import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requirePermission } from "@/lib/auth";
import { updateDepartmentAction } from "@/modules/master-data/actions/master-data.actions";
import { getDepartment } from "@/modules/master-data/departments";

interface EditDepartmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDepartmentPage({
  params,
}: EditDepartmentPageProps) {
  await requirePermission("master.department");
  const { id } = await params;
  const department = await getDepartment(id);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Edit Department</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateDepartmentAction} className="space-y-3">
            <input name="id" type="hidden" value={department.id} />
            <Input defaultValue={department.code} name="code" placeholder="Code" required />
            <Input defaultValue={department.name} name="name" placeholder="Name" required />
            <button className={buttonVariants()} type="submit">Save</button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

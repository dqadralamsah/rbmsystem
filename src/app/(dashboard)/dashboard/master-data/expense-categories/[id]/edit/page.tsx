import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requirePermission } from "@/lib/auth";
import { updateExpenseCategoryAction } from "@/modules/master-data/actions/master-data.actions";
import { getExpenseCategory } from "@/modules/master-data/expense-categories";

interface EditExpenseCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpenseCategoryPage({
  params,
}: EditExpenseCategoryPageProps) {
  await requirePermission("master.category");
  const { id } = await params;
  const category = await getExpenseCategory(id);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Edit Expense Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateExpenseCategoryAction} className="space-y-3">
            <input name="id" type="hidden" value={category.id} />
            <Input defaultValue={category.code} name="code" placeholder="Code" required />
            <Input defaultValue={category.name} name="name" placeholder="Name" required />
            <Textarea defaultValue={category.description ?? ""} name="description" placeholder="Description" />
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked={category.isActive} name="isActive" type="checkbox" />
              Active
            </label>
            <button className={buttonVariants()} type="submit">Save</button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

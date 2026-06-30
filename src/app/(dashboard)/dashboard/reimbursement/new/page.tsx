import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requirePermission } from "@/lib/auth";
import {
  REIMBURSEMENT_PERMISSIONS,
  listActiveReimbursementCategories,
} from "@/modules/reimbursement";
import { ReimbursementForm } from "@/modules/reimbursement/components/ReimbursementForm";

export default async function NewReimbursementPage() {
  await requirePermission(REIMBURSEMENT_PERMISSIONS.create);
  const categories = await listActiveReimbursementCategories();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">New Reimbursement</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Save as draft or submit directly to the approval flow.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <ReimbursementForm categories={categories} mode="create" />
        </CardContent>
      </Card>
    </section>
  );
}

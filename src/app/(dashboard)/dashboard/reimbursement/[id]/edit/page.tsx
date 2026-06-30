import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReimbursementStatus } from "@/generated/prisma/enums";
import { requirePermission } from "@/lib/auth";
import {
  EDITABLE_REIMBURSEMENT_STATUSES,
  REIMBURSEMENT_PERMISSIONS,
  getMyReimbursement,
  listActiveReimbursementCategories,
} from "@/modules/reimbursement";
import { ReimbursementForm } from "@/modules/reimbursement/components/ReimbursementForm";
import {
  formatCurrency,
  getDisplayNumber,
} from "@/modules/reimbursement/components/reimbursement-display";
import { ReimbursementStatusBadge } from "@/modules/reimbursement/components/ReimbursementStatusBadge";

interface EditReimbursementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditReimbursementPage({
  params,
}: EditReimbursementPageProps) {
  const user = await requirePermission(REIMBURSEMENT_PERMISSIONS.update);
  const { id } = await params;
  const [reimbursement, categories] = await Promise.all([
    getMyReimbursement(id, user),
    listActiveReimbursementCategories(),
  ]);
  const readOnly = !EDITABLE_REIMBURSEMENT_STATUSES.some(
    (status) => status === reimbursement.status,
  );
  const isReturned =
    reimbursement.status === ReimbursementStatus.RETURNED_BY_MANAGER ||
    reimbursement.status === ReimbursementStatus.RETURNED_BY_FINANCE;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">
          {getDisplayNumber(reimbursement.number, reimbursement.status)}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <ReimbursementStatusBadge status={reimbursement.status} />
          <span>{formatCurrency(reimbursement.totalAmount)}</span>
        </div>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">
            {readOnly ? "Request Snapshot" : "Edit Draft"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReimbursementForm
            categories={categories}
            initialDescription={reimbursement.description}
            initialItems={reimbursement.items.map((item) => ({
              categoryId: item.categoryId,
              description: item.description,
              amount: item.amount.toString(),
            }))}
            mode="edit"
            readOnly={readOnly}
            reimbursementId={reimbursement.id}
            submitLabel={isReturned ? "Resubmit" : "Submit"}
          />
        </CardContent>
      </Card>
    </section>
  );
}

import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReimbursementStatus } from "@/generated/prisma/enums";
import { requirePermission } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  REIMBURSEMENT_PERMISSIONS,
  EDITABLE_REIMBURSEMENT_STATUSES,
  getMyReimbursement,
} from "@/modules/reimbursement";
import { deleteDraftAction, submitDraftAction } from "@/modules/reimbursement/actions/reimbursement.actions";
import {
  formatCurrency,
  formatDate,
  getDisplayNumber,
  getLatestReturnHistory,
} from "@/modules/reimbursement/components/reimbursement-display";
import { ReimbursementStatusBadge } from "@/modules/reimbursement/components/ReimbursementStatusBadge";

interface ReimbursementDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReimbursementDetailPage({
  params,
}: ReimbursementDetailPageProps) {
  const user = await requirePermission(REIMBURSEMENT_PERMISSIONS.create);
  const { id } = await params;
  const reimbursement = await getMyReimbursement(id, user);
  const isDraft = reimbursement.status === ReimbursementStatus.DRAFT;
  const canEdit = EDITABLE_REIMBURSEMENT_STATUSES.some(
    (status) => status === reimbursement.status,
  );
  const returnHistory = getLatestReturnHistory(reimbursement.workflowHistories);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {getDisplayNumber(reimbursement.number, reimbursement.status)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {formatDate(reimbursement.createdAt)}
          </p>
        </div>

        {canEdit ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
              href={`/dashboard/reimbursement/${reimbursement.id}/edit`}
            >
              <PencilSimple className="size-4" weight="bold" />
              {isDraft ? "Edit Draft" : "Edit Returned"}
            </Link>
            <form action={submitDraftAction}>
              <input name="id" type="hidden" value={reimbursement.id} />
              <button className={buttonVariants()} type="submit">
                {isDraft ? "Submit" : "Resubmit"}
              </button>
            </form>
            {isDraft ? (
              <form action={deleteDraftAction}>
                <input name="id" type="hidden" value={reimbursement.id} />
                <button
                  className={buttonVariants({ variant: "outline" })}
                  type="submit"
                >
                  Cancel Draft
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-base">Request Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <ReimbursementStatusBadge status={reimbursement.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total Amount</dt>
                <dd className="mt-1 font-semibold">
                  {formatCurrency(reimbursement.totalAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted At</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(reimbursement.submittedAt)}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {reimbursement.description ?? "-"}
              </p>
            </div>

            {returnHistory ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="font-medium">Return Reason</p>
                <p className="mt-1">{returnHistory.notes ?? "-"}</p>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-md border">
              <div className="grid gap-3 border-b bg-muted/40 px-4 py-3 text-sm font-medium md:grid-cols-[1fr_1.4fr_160px]">
                <span>Category</span>
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="divide-y">
                {reimbursement.items.map((item) => (
                  <div
                    className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_1.4fr_160px]"
                    key={item.id}
                  >
                    <span>{item.category.name}</span>
                    <span className="text-muted-foreground">
                      {item.description}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-base">Workflow Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reimbursement.workflowHistories.map((history) => (
                <div className="border-l pl-4" key={history.id}>
                  <p className="text-sm font-medium">
                    {history.action.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(history.createdAt)} by{" "}
                    {history.performedBy.fullName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {history.fromStatus
                      ? `${history.fromStatus.replaceAll("_", " ")} to `
                      : ""}
                    {history.toStatus.replaceAll("_", " ")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-base">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {reimbursement.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attachment metadata recorded.
                </p>
              ) : (
                <div className="space-y-2">
                  {reimbursement.attachments.map((attachment) => (
                    <div className="rounded-md border px-3 py-2 text-sm" key={attachment.id}>
                      <p className="font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.mimeType} - {attachment.fileSize} bytes
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

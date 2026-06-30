import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ReimbursementStatus } from "@/generated/prisma/enums";
import { requirePermission } from "@/lib/auth";
import {
  markReimbursementAsPaidAction,
  returnReimbursementAction,
  verifyReimbursementAction,
} from "@/modules/finance/actions/finance.actions";
import { getFinanceDetail } from "@/modules/finance";
import {
  formatCurrency,
  formatDate,
} from "@/modules/reimbursement/components/reimbursement-display";
import { ReimbursementStatusBadge } from "@/modules/reimbursement/components/ReimbursementStatusBadge";
import { buttonVariants } from "@/components/ui/button";

interface FinanceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FinanceDetailPage({
  params,
}: FinanceDetailPageProps) {
  await requirePermission("finance.review");
  const { id } = await params;
  const reimbursement = await getFinanceDetail(id);
  const canVerify =
    reimbursement.status === ReimbursementStatus.APPROVED_BY_MANAGER;
  const canMarkPaid =
    reimbursement.status === ReimbursementStatus.APPROVED_BY_FINANCE;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">{reimbursement.number}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Requested by {reimbursement.requester.fullName}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-base">Verification Detail</CardTitle>
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
                <dt className="text-muted-foreground">Paid At</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(reimbursement.paidAt)}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {reimbursement.description ?? "-"}
              </p>
            </div>

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
          {canVerify ? (
            <Card className="rounded-md">
              <CardHeader>
                <CardTitle className="text-base">Verification Action</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={verifyReimbursementAction} className="space-y-3">
                  <input name="id" type="hidden" value={reimbursement.id} />
                  <Textarea
                    name="notes"
                    placeholder="Verification note"
                    required
                  />
                  <button className={buttonVariants()} type="submit">
                    Verify
                  </button>
                </form>
                <form action={returnReimbursementAction} className="mt-4 space-y-3">
                  <input name="id" type="hidden" value={reimbursement.id} />
                  <Textarea
                    name="notes"
                    placeholder="Return reason"
                    required
                  />
                  <button
                    className={buttonVariants({ variant: "outline" })}
                    type="submit"
                  >
                    Return
                  </button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {canMarkPaid ? (
            <Card className="rounded-md">
              <CardHeader>
                <CardTitle className="text-base">Payment Action</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={markReimbursementAsPaidAction} className="space-y-3">
                  <input name="id" type="hidden" value={reimbursement.id} />
                  <Textarea
                    name="notes"
                    placeholder="Payment information"
                    required
                  />
                  <button className={buttonVariants()} type="submit">
                    Mark as Paid
                  </button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
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
                  {history.notes ? (
                    <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs">
                      {history.notes}
                    </p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

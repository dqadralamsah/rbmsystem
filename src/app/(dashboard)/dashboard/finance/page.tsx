import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requirePermission } from "@/lib/auth";
import { listFinanceQueue } from "@/modules/finance";
import {
  formatCurrency,
  formatDate,
} from "@/modules/reimbursement/components/reimbursement-display";
import { ReimbursementStatusBadge } from "@/modules/reimbursement/components/ReimbursementStatusBadge";

interface FinancePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined) {
  const page = Number(firstParam(value));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
  await requirePermission("finance.review");
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstParam(resolvedSearchParams.search);
  const page = parsePage(resolvedSearchParams.page);
  const result = await listFinanceQueue({
    search,
    pagination: {
      page,
      pageSize: 10,
    },
  });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Finance Verification</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manager-approved reimbursements waiting for finance processing.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Finance Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_120px]">
            <div className="relative">
              <MagnifyingGlass
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                weight="bold"
              />
              <Input
                className="pl-9"
                defaultValue={search ?? ""}
                name="search"
                placeholder="Search number, requester, or description"
              />
            </div>
            <button className={buttonVariants({ variant: "outline" })}>
              Search
            </button>
          </form>

          {result.data.length === 0 ? (
            <div className="rounded-md border border-dashed px-6 py-10 text-center">
              <p className="font-medium">No finance queue</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Manager-approved requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_110px] gap-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium md:grid">
                <span>Number</span>
                <span>Requester</span>
                <span>Status</span>
                <span>Total</span>
                <span>Action</span>
              </div>
              <div className="divide-y">
                {result.data.map((reimbursement) => (
                  <div
                    className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_1fr_1fr_110px] md:items-center"
                    key={reimbursement.id}
                  >
                    <div>
                      <p className="font-medium">{reimbursement.number}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(reimbursement.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {reimbursement.requester.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reimbursement.requester.department.name}
                      </p>
                    </div>
                    <ReimbursementStatusBadge status={reimbursement.status} />
                    <p className="text-sm font-medium">
                      {formatCurrency(reimbursement.totalAmount)}
                    </p>
                    <Link
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/dashboard/finance/${reimbursement.id}`}
                    >
                      Process
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {result.meta.page} of {result.meta.totalPages}
            </span>
            <span>{result.meta.totalItems} total request(s)</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

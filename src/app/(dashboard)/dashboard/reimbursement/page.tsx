import { FilePlus, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ReimbursementStatus } from "@/generated/prisma/enums";
import { requirePermission } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  REIMBURSEMENT_PERMISSIONS,
  listMyReimbursements,
} from "@/modules/reimbursement";
import {
  formatCurrency,
  formatDate,
  getDisplayNumber,
} from "@/modules/reimbursement/components/reimbursement-display";
import { ReimbursementStatusBadge } from "@/modules/reimbursement/components/ReimbursementStatusBadge";

interface ReimbursementPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined) {
  const page = Number(firstParam(value));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value: string | string[] | undefined) {
  const status = firstParam(value);

  if (!status) {
    return undefined;
  }

  return Object.values(ReimbursementStatus).includes(
    status as ReimbursementStatus,
  )
    ? (status as ReimbursementStatus)
    : undefined;
}

export default async function ReimbursementPage({
  searchParams,
}: ReimbursementPageProps) {
  const user = await requirePermission(REIMBURSEMENT_PERMISSIONS.create);
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstParam(resolvedSearchParams.search);
  const status = parseStatus(resolvedSearchParams.status);
  const page = parsePage(resolvedSearchParams.page);
  const result = await listMyReimbursements({
    requesterId: user.userId,
    search,
    status,
    pagination: {
      page,
      pageSize: 10,
    },
  });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Reimbursements</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drafts and submitted requests owned by your account.
          </p>
        </div>

        <Link
          className={cn(buttonVariants(), "w-full sm:w-auto")}
          href="/dashboard/reimbursement/new"
        >
          <FilePlus className="size-4" weight="bold" />
          New Request
        </Link>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Request List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_220px_120px]">
            <div className="relative">
              <MagnifyingGlass
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                weight="bold"
              />
              <Input
                className="pl-9"
                defaultValue={search ?? ""}
                name="search"
                placeholder="Search number or description"
              />
            </div>
            <Select defaultValue={status ?? ""} name="status">
              <option value="">All statuses</option>
              {Object.values(ReimbursementStatus).map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
            <button className={buttonVariants({ variant: "outline" })}>
              Search
            </button>
          </form>

          {result.data.length === 0 ? (
            <div className="rounded-md border border-dashed px-6 py-10 text-center">
              <p className="font-medium">No reimbursement found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a draft to start your first request.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_110px] gap-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium md:grid">
                <span>Number</span>
                <span>Status</span>
                <span>Total</span>
                <span>Updated</span>
                <span>Action</span>
              </div>
              <div className="divide-y">
                {result.data.map((reimbursement) => (
                  <div
                    className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_110px] md:items-center"
                    key={reimbursement.id}
                  >
                    <div>
                      <p className="font-medium">
                        {getDisplayNumber(
                          reimbursement.number,
                          reimbursement.status,
                        )}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {reimbursement.description ?? "No description"}
                      </p>
                    </div>
                    <ReimbursementStatusBadge status={reimbursement.status} />
                    <p className="text-sm font-medium">
                      {formatCurrency(reimbursement.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(reimbursement.updatedAt)}
                    </p>
                    <Link
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/dashboard/reimbursement/${reimbursement.id}`}
                    >
                      Detail
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

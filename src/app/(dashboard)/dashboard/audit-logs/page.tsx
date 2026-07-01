import { Eye } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuditAction } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  auditLogListQuerySchema,
  listAuditLogs,
} from "@/modules/audit-log";

interface AuditLogsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function buildPageHref(
  params: URLSearchParams,
  page: number,
) {
  const nextParams = new URLSearchParams(params);
  nextParams.set("page", String(page));

  return `/dashboard/audit-logs?${nextParams.toString()}`;
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const user = await requireAuth();
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawFilters = {
    search: firstParam(resolvedSearchParams.search),
    action: firstParam(resolvedSearchParams.action),
    resource: firstParam(resolvedSearchParams.resource),
    actorId: firstParam(resolvedSearchParams.actorId),
    dateFrom: firstParam(resolvedSearchParams.dateFrom),
    dateTo: firstParam(resolvedSearchParams.dateTo),
  };
  const filters = auditLogListQuerySchema.parse(rawFilters);
  const page = numberParam(firstParam(resolvedSearchParams.page), 1);
  const pageSize = numberParam(firstParam(resolvedSearchParams.pageSize), 20);
  const auditLogs = await listAuditLogs(
    {
      ...filters,
      pagination: { page, pageSize },
    },
    user,
  );
  const currentParams = new URLSearchParams();

  Object.entries({
    ...rawFilters,
    pageSize: String(pageSize),
  }).forEach(([key, value]) => {
    if (value) {
      currentParams.set(key, value);
    }
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Audit Log</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only system activity records for security and compliance review.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_190px_190px_160px_160px_100px]">
            <Input
              defaultValue={rawFilters.search ?? ""}
              name="search"
              placeholder="Search activity"
            />
            <Select defaultValue={rawFilters.action ?? ""} name="action">
              <option value="">All Actions</option>
              {Object.values(AuditAction).map((action) => (
                <option key={action} value={action}>
                  {action.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
            <Input
              defaultValue={rawFilters.resource ?? ""}
              name="resource"
              placeholder="Resource"
            />
            <Input
              defaultValue={rawFilters.dateFrom ?? ""}
              name="dateFrom"
              type="date"
            />
            <Input
              defaultValue={rawFilters.dateTo ?? ""}
              name="dateTo"
              type="date"
            />
            <button className={buttonVariants({ variant: "outline" })}>
              Search
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">System Activity</CardTitle>
          <span className="text-sm text-muted-foreground">
            {auditLogs.meta.totalItems} records
          </span>
        </CardHeader>
        <CardContent>
          {auditLogs.data.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No audit log found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Resource</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {auditLogs.data.map((auditLog) => (
                    <tr key={auditLog.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDateTime(auditLog.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {auditLog.actor?.fullName ?? "System"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {auditLog.actor?.role.name ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{auditLog.action.replaceAll("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{auditLog.resource}</div>
                        <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                          {auditLog.resourceId ?? "-"}
                        </div>
                      </td>
                      <td className="max-w-[320px] truncate px-4 py-3 text-muted-foreground">
                        {auditLog.description ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          className={cn(
                            buttonVariants({ size: "sm", variant: "outline" }),
                            "gap-2",
                          )}
                          href={`/dashboard/audit-logs/${auditLog.id}`}
                        >
                          <Eye className="size-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Page {auditLogs.meta.page} of {auditLogs.meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Link
                aria-disabled={!auditLogs.meta.hasPreviousPage}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  !auditLogs.meta.hasPreviousPage &&
                    "pointer-events-none opacity-50",
                )}
                href={buildPageHref(currentParams, auditLogs.meta.page - 1)}
              >
                Previous
              </Link>
              <Link
                aria-disabled={!auditLogs.meta.hasNextPage}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  !auditLogs.meta.hasNextPage &&
                    "pointer-events-none opacity-50",
                )}
                href={buildPageHref(currentParams, auditLogs.meta.page + 1)}
              >
                Next
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

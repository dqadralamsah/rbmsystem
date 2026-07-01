import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { getAuditLog } from "@/modules/audit-log";

interface AuditLogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(value);
}

function PrettyJson({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  const content =
    value === null || value === undefined
      ? "-"
      : JSON.stringify(value, null, 2);

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[420px] overflow-auto rounded-md bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}

export default async function AuditLogDetailPage({
  params,
}: AuditLogDetailPageProps) {
  const user = await requireAuth();
  const { id } = await params;
  const auditLog = await getAuditLog(id, user);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Audit Log Detail</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable system activity record.
          </p>
        </div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/dashboard/audit-logs"
        >
          Back
        </Link>
      </div>

      <Card className="rounded-md">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Actor</p>
            <p className="mt-1 font-medium">
              {auditLog.actor?.fullName ?? "System"}
            </p>
            <p className="text-sm text-muted-foreground">
              {auditLog.actor?.employeeId ?? "-"} /{" "}
              {auditLog.actor?.role.name ?? "-"} /{" "}
              {auditLog.actor?.department.name ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Timestamp
            </p>
            <p className="mt-1 font-medium">
              {formatDateTime(auditLog.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Action</p>
            <div className="mt-1">
              <Badge>{auditLog.action.replaceAll("_", " ")}</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Resource</p>
            <p className="mt-1 font-medium">{auditLog.resource}</p>
            <p className="break-all text-sm text-muted-foreground">
              {auditLog.resourceId ?? "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-muted-foreground">
              Description
            </p>
            <p className="mt-1 text-sm">
              {auditLog.description ?? "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <PrettyJson title="Old Values" value={auditLog.oldValues} />
        <PrettyJson title="New Values" value={auditLog.newValues} />
      </div>
      <PrettyJson title="Metadata" value={auditLog.metadata} />
    </section>
  );
}

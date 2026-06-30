import {
  ArrowRight,
  ClipboardText,
  CurrencyCircleDollar,
  SealCheck,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  type DashboardActivityItem,
  type DashboardReimbursementItem,
  getDashboardData,
} from "@/modules/dashboard";
import {
  formatCurrency,
  formatDate,
  getDisplayNumber,
} from "@/modules/reimbursement/components/reimbursement-display";
import { ReimbursementStatusBadge } from "@/modules/reimbursement/components/ReimbursementStatusBadge";

interface SummaryCardProps {
  label: string;
  value: number;
  description: string;
}

function SummaryCard({ label, value, description }: SummaryCardProps) {
  return (
    <Card className="rounded-md">
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function WelcomeCard({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="rounded-md">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link className={cn(buttonVariants(), "w-full md:w-auto")} href={actionHref}>
            {actionLabel}
            <ArrowRight className="size-4" weight="bold" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ReimbursementList({
  items,
  detailBasePath,
  emptyMessage,
}: {
  items: DashboardReimbursementItem[];
  detailBasePath: string;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="divide-y rounded-md border">
      {items.map((item) => (
        <Link
          className="grid gap-3 px-4 py-3 transition-colors hover:bg-accent md:grid-cols-[1fr_150px_150px] md:items-center"
          href={`${detailBasePath}/${item.id}`}
          key={item.id}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {getDisplayNumber(item.number, item.status)}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {item.requester
                ? `${item.requester.fullName} - ${item.requester.department.name}`
                : item.description ?? "No description"}
            </p>
          </div>
          <ReimbursementStatusBadge status={item.status} />
          <div className="text-sm font-medium md:text-right">
            {formatCurrency(item.totalAmount)}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActivityList({
  items,
  emptyMessage,
}: {
  items: DashboardActivityItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div className="border-l pl-4" key={item.id}>
          <p className="text-sm font-medium">
            {item.action.replaceAll("_", " ")} - {item.reimbursement.number}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(item.createdAt)} by {item.performedBy.fullName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.fromStatus ? `${item.fromStatus.replaceAll("_", " ")} to ` : ""}
            {item.toStatus.replaceAll("_", " ")}
          </p>
          {item.notes ? (
            <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs">
              {item.notes}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const dashboard = await getDashboardData(user);

  if (dashboard.type === "manager") {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <WelcomeCard
          actionHref="/dashboard/approval"
          actionLabel="Open Approval"
          description="Review submitted reimbursements from your direct reports."
          title={`Welcome, ${user.fullName}`}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            description="Submitted by direct reports"
            label="Waiting Approval"
            value={dashboard.summary.waitingApproval}
          />
          <SummaryCard
            description="Manager approvals today"
            label="Approved Today"
            value={dashboard.summary.approvedToday}
          />
          <SummaryCard
            description="Returned for revision today"
            label="Returned Today"
            value={dashboard.summary.returnedToday}
          />
          <SummaryCard
            description="Rejected today"
            label="Rejected Today"
            value={dashboard.summary.rejectedToday}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SealCheck className="size-5 text-primary" weight="duotone" />
                Waiting Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReimbursementList
                detailBasePath="/dashboard/approval"
                emptyMessage="No submitted reimbursement is waiting for your review."
                items={dashboard.waitingApprovals}
              />
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-base">Recent Approval Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityList
                emptyMessage="No approval activity yet."
                items={dashboard.recentActivity}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (dashboard.type === "finance") {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <WelcomeCard
          actionHref="/dashboard/finance"
          actionLabel="Open Finance Queue"
          description="Verify manager-approved reimbursements and complete payments."
          title={`Welcome, ${user.fullName}`}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            description="Ready for finance verification"
            label="Waiting Verification"
            value={dashboard.summary.waitingVerification}
          />
          <SummaryCard
            description="Verified by you today"
            label="Verified Today"
            value={dashboard.summary.verifiedToday}
          />
          <SummaryCard
            description="Approved by finance, not paid yet"
            label="Waiting Payment"
            value={dashboard.summary.waitingPayment}
          />
          <SummaryCard
            description="Paid by you today"
            label="Paid Today"
            value={dashboard.summary.paidToday}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CurrencyCircleDollar className="size-5 text-primary" weight="duotone" />
                Finance Work Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium">Waiting Verification</p>
                <ReimbursementList
                  detailBasePath="/dashboard/finance"
                  emptyMessage="No reimbursement is waiting for verification."
                  items={dashboard.waitingVerificationList}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Waiting Payment</p>
                <ReimbursementList
                  detailBasePath="/dashboard/finance"
                  emptyMessage="No reimbursement is waiting for payment."
                  items={dashboard.waitingPaymentList}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-base">Recent Finance Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityList
                emptyMessage="No finance activity yet."
                items={dashboard.recentActivity}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (dashboard.type === "admin") {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <WelcomeCard
          description="Global system overview across reimbursement, approval, finance, and users."
          title={`Welcome, ${user.fullName}`}
        />

        <div className="grid gap-4 md:grid-cols-5">
          <SummaryCard
            description="All requests"
            label="Total Reimbursement"
            value={dashboard.summary.totalReimbursement}
          />
          <SummaryCard
            description="Active users"
            label="Total User"
            value={dashboard.summary.totalUser}
          />
          <SummaryCard
            description="Submitted requests"
            label="Pending Approval"
            value={dashboard.summary.pendingApproval}
          />
          <SummaryCard
            description="Manager-approved requests"
            label="Pending Verification"
            value={dashboard.summary.pendingVerification}
          />
          <SummaryCard
            description="Paid this month"
            label="Paid This Month"
            value={dashboard.summary.paidThisMonth}
          />
        </div>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-base">Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList
              emptyMessage="No workflow activity yet."
              items={dashboard.recentSystemActivity}
            />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <WelcomeCard
        actionHref="/dashboard/reimbursement/new"
        actionLabel="Create Reimbursement"
        description="Track your reimbursements, drafts, returned requests, and payments."
        title={`Welcome, ${user.fullName}`}
      />

      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <SummaryCard
          description="All your requests"
          label="Total"
          value={dashboard.summary.total}
        />
        <SummaryCard
          description="Not submitted"
          label="Draft"
          value={dashboard.summary.draft}
        />
        <SummaryCard
          description="Waiting manager"
          label="Submitted"
          value={dashboard.summary.submitted}
        />
        <SummaryCard
          description="Needs revision"
          label="Returned"
          value={dashboard.summary.returned}
        />
        <SummaryCard
          description="Approved in workflow"
          label="Approved"
          value={dashboard.summary.approved}
        />
        <SummaryCard
          description="Payment done"
          label="Paid"
          value={dashboard.summary.paid}
        />
        <SummaryCard
          description="Final rejected"
          label="Rejected"
          value={dashboard.summary.rejected}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <WarningCircle className="size-5 text-primary" weight="duotone" />
              Need Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReimbursementList
              detailBasePath="/dashboard/reimbursement"
              emptyMessage="No draft or returned reimbursement needs your attention."
              items={dashboard.needAttention}
            />
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardText className="size-5 text-primary" weight="duotone" />
              Recent Reimbursements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReimbursementList
              detailBasePath="/dashboard/reimbursement"
              emptyMessage="No reimbursement has been created yet."
              items={dashboard.recentReimbursements}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle className="size-5 text-primary" weight="duotone" />
            Session Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Employee ID</dt>
              <dd className="mt-1 font-medium">
                {user.employeeId ?? "Not assigned"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-1 font-medium">{user.role}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Department</dt>
              <dd className="mt-1 font-medium">{user.departmentName}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}

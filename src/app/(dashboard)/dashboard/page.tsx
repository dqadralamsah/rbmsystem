import { ClipboardText, CurrencyCircleDollar, SealCheck } from "@phosphor-icons/react/dist/ssr";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardText className="size-5 text-primary" weight="duotone" />
              My Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Draft and submitted reimbursements
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SealCheck className="size-5 text-primary" weight="duotone" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Items waiting for approval
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CurrencyCircleDollar
                className="size-5 text-primary"
                weight="duotone"
              />
              Finance Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Approved claims pending payment
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Session Profile</CardTitle>
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

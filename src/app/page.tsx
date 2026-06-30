import {
  Buildings,
  IdentificationBadge,
  SignIn,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import { loginWithDevelopmentUser } from "@/lib/auth/actions";
import {
  isDevelopmentAuthenticationEnabled,
  listDevelopmentLoginUsers,
} from "@/lib/auth/development-auth";

export default async function Home() {
  const isDevelopmentAuthEnabled = isDevelopmentAuthenticationEnabled();
  const users = await listDevelopmentLoginUsers();
  const currentUser = await getCurrentUser();
  const isLoginDisabled = !isDevelopmentAuthEnabled || users.length === 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-md border bg-background shadow-sm">
            <Buildings className="size-8 text-primary" weight="duotone" />
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Reimbursement System
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Internal reimbursement management for requests, approvals,
              finance verification, payment, and audit history.
            </p>
          </div>
        </div>

        <Card className="w-full rounded-md">
          <CardHeader>
            <CardTitle>Development Login</CardTitle>
            <CardDescription>
              Select a seeded user profile to enter the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginWithDevelopmentUser} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="userId">User</Label>
                <Select
                  id="userId"
                  name="userId"
                  required
                  defaultValue={currentUser?.userId ?? ""}
                  disabled={isLoginDisabled}
                >
                  <option value="" disabled>
                    Select user
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} - {user.role} - {user.department}
                    </option>
                  ))}
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoginDisabled}>
                <SignIn className="size-4" weight="bold" />
                Login
              </Button>
            </form>

            {!isDevelopmentAuthEnabled ? (
              <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Development authentication is disabled in this environment.
              </p>
            ) : null}

            {isDevelopmentAuthEnabled && users.length === 0 ? (
              <p className="mt-6 rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                No active users are available.
              </p>
            ) : null}

            {currentUser ? (
              <div className="mt-6 rounded-md border bg-muted/40 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <IdentificationBadge className="size-4" weight="duotone" />
                  {currentUser.fullName}
                </div>
                <dl className="mt-3 grid gap-2 text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Role</dt>
                    <dd className="font-medium text-foreground">
                      {currentUser.role}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Department</dt>
                    <dd className="font-medium text-foreground">
                      {currentUser.departmentName}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

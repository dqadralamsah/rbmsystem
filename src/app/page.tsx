import { SignIn, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { revalidatePath } from "next/cache";

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
import {
  getAuthSession,
  parseAuthRole,
  setMockAuthSession,
} from "@/lib/auth";

async function loginWithMockRole(formData: FormData) {
  "use server";

  const role = parseAuthRole(formData.get("role"));

  // This single write point is intentionally temporary so SSO/Auth.js can replace cookie creation without changing UI flows.
  await setMockAuthSession(role);
  revalidatePath("/");
}

export default async function Home() {
  const session = await getAuthSession();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="size-4" weight="duotone" />
            Development Authentication Bypass
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl">
              Internal E-Reimbursement System
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Select a development role to create a mock session with the same
              shape the approval dashboards will read after SSO is connected.
            </p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Masuk sebagai</CardTitle>
            <CardDescription>
              Pilih role untuk mensimulasikan session pengguna.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginWithMockRole} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  name="role"
                  required
                  defaultValue={session?.role ?? ""}
                >
                  <option value="" disabled>
                    Pilih role development
                  </option>
                  <option value="REQUESTER">Pemohon (Employee)</option>
                  <option value="MANAGER">Atasan (Manager)</option>
                  <option value="FINANCE">Finance</option>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                <SignIn className="size-4" weight="bold" />
                Simulasikan Login
              </Button>
            </form>

            {session ? (
              <div className="mt-6 rounded-md border bg-muted/40 p-4 text-sm">
                <p className="font-medium text-foreground">
                  Session aktif: {session.userName}
                </p>
                <dl className="mt-3 grid gap-2 text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Role</dt>
                    <dd className="font-medium text-foreground">
                      {session.role}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Approver</dt>
                    <dd className="font-medium text-foreground">
                      {session.approverName}
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

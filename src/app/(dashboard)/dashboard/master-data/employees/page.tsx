import Link from "next/link";

import { UserStatus } from "@/generated/prisma/enums";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requirePermission } from "@/lib/auth";
import {
  createEmployeeAction,
  deleteEmployeeAction,
} from "@/modules/master-data/actions/master-data.actions";
import { listDepartments } from "@/modules/master-data/departments";
import { listEmployees } from "@/modules/master-data/employees";
import { listRoles } from "@/modules/master-data/roles";

interface EmployeesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  await requirePermission("master.user");
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = firstParam(resolvedSearchParams.search);
  const departmentId = firstParam(resolvedSearchParams.departmentId);
  const roleId = firstParam(resolvedSearchParams.roleId);
  const status = firstParam(resolvedSearchParams.status) as UserStatus | undefined;
  const [employees, departments, roles, managers] = await Promise.all([
    listEmployees({
      search,
      departmentId,
      roleId,
      status,
      pagination: { page: 1, pageSize: 50 },
    }),
    listDepartments({ pagination: { page: 1, pageSize: 100 } }),
    listRoles({ pagination: { page: 1, pageSize: 100 } }),
    listEmployees({ pagination: { page: 1, pageSize: 100 } }),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Employee records used for mock login and future SSO matching.
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Create User</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEmployeeAction} className="grid gap-3 md:grid-cols-3">
            <Input name="employeeId" placeholder="Employee ID" />
            <Input name="email" placeholder="Email" required type="email" />
            <Input name="fullName" placeholder="Full Name" required />
            <Select name="departmentId" required>
              <option value="">Department</option>
              {departments.data.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </Select>
            <Select name="roleId" required>
              <option value="">Role</option>
              {roles.data.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </Select>
            <Select name="managerId">
              <option value="">No manager</option>
              {managers.data.map((manager) => (
                <option key={manager.id} value={manager.id}>{manager.fullName}</option>
              ))}
            </Select>
            <Select defaultValue={UserStatus.ACTIVE} name="status">
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.INACTIVE}>Inactive</option>
            </Select>
            <button className={buttonVariants()} type="submit">Create</button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">User List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_170px_170px_150px_120px]">
            <Input defaultValue={search ?? ""} name="search" placeholder="Search name, email, employee ID" />
            <Select defaultValue={departmentId ?? ""} name="departmentId">
              <option value="">All departments</option>
              {departments.data.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </Select>
            <Select defaultValue={roleId ?? ""} name="roleId">
              <option value="">All roles</option>
              {roles.data.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </Select>
            <Select defaultValue={status ?? ""} name="status">
              <option value="">All statuses</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.INACTIVE}>Inactive</option>
            </Select>
            <button className={buttonVariants({ variant: "outline" })}>Search</button>
          </form>

          {employees.data.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No user found.
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {employees.data.map((employee) => (
                <div className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_1fr_120px_180px] md:items-center" key={employee.id}>
                  <div>
                    <p className="text-sm font-medium">{employee.fullName}</p>
                    <p className="text-xs text-muted-foreground">{employee.employeeId ?? "-"} - {employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm">{employee.department.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.role.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{employee.status}</span>
                  <div className="flex gap-2 md:justify-end">
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/dashboard/master-data/employees/${employee.id}/edit`}>
                      Edit
                    </Link>
                    <form action={deleteEmployeeAction}>
                      <input name="id" type="hidden" value={employee.id} />
                      <button className={buttonVariants({ size: "sm", variant: "outline" })} type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

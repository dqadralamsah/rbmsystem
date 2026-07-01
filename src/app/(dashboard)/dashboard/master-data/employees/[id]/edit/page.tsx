import { UserStatus } from "@/generated/prisma/enums";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requirePermission } from "@/lib/auth";
import { updateEmployeeAction } from "@/modules/master-data/actions/master-data.actions";
import { listDepartments } from "@/modules/master-data/departments";
import { getEmployee, listEmployees } from "@/modules/master-data/employees";
import { listRoles } from "@/modules/master-data/roles";

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  await requirePermission("master.user");
  const { id } = await params;
  const [employee, departments, roles, managers] = await Promise.all([
    getEmployee(id),
    listDepartments({ pagination: { page: 1, pageSize: 100 } }),
    listRoles({ pagination: { page: 1, pageSize: 100 } }),
    listEmployees({ pagination: { page: 1, pageSize: 100 } }),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateEmployeeAction} className="grid gap-3 md:grid-cols-2">
            <input name="id" type="hidden" value={employee.id} />
            <Input defaultValue={employee.employeeId ?? ""} name="employeeId" placeholder="Employee ID" />
            <Input defaultValue={employee.email} name="email" placeholder="Email" required type="email" />
            <Input defaultValue={employee.fullName} name="fullName" placeholder="Full Name" required />
            <Select defaultValue={employee.departmentId} name="departmentId" required>
              {departments.data.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </Select>
            <Select defaultValue={employee.roleId} name="roleId" required>
              {roles.data.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </Select>
            <Select defaultValue={employee.managerId ?? ""} name="managerId">
              <option value="">No manager</option>
              {managers.data
                .filter((manager) => manager.id !== employee.id)
                .map((manager) => (
                  <option key={manager.id} value={manager.id}>{manager.fullName}</option>
                ))}
            </Select>
            <Select defaultValue={employee.status} name="status">
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.INACTIVE}>Inactive</option>
            </Select>
            <button className={buttonVariants()} type="submit">Save</button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { UserStatus } from "@/generated/prisma/enums";
import { requirePermission } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import {
  AuditAction,
  recordMutationAuditLog,
} from "@/modules/audit-log";
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  updateDepartment,
} from "@/modules/master-data/departments";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  updateEmployee,
} from "@/modules/master-data/employees";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  getExpenseCategory,
  updateExpenseCategory,
} from "@/modules/master-data/expense-categories";
import {
  createRole,
  getRole,
  updateRole,
} from "@/modules/master-data/roles";
import {
  getRolePermissionMatrix,
  updateRolePermissions,
} from "@/modules/master-data/role-permissions";

const MASTER_DATA_PATH = "/dashboard/master-data";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function nullableStringValue(formData: FormData, key: string) {
  return stringValue(formData, key) ?? null;
}

function requiredId(formData: FormData) {
  const id = stringValue(formData, "id");

  if (!id) {
    throw new ValidationError("ID is required.");
  }

  return id;
}

export async function createDepartmentAction(formData: FormData) {
  const user = await requirePermission("master.department");
  const department = await createDepartment({
    code: stringValue(formData, "code") ?? "",
    name: stringValue(formData, "name") ?? "",
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.CREATE,
    resource: "Department",
    resourceId: department.id,
    description: "Created department.",
    newValues: department,
  });
  revalidatePath(`${MASTER_DATA_PATH}/departments`);
}

export async function updateDepartmentAction(formData: FormData) {
  const user = await requirePermission("master.department");
  const id = requiredId(formData);
  const oldDepartment = await getDepartment(id);

  const department = await updateDepartment(id, {
    code: stringValue(formData, "code"),
    name: stringValue(formData, "name"),
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.UPDATE,
    resource: "Department",
    resourceId: department.id,
    description: "Updated department.",
    oldValues: oldDepartment,
    newValues: department,
  });
  revalidatePath(`${MASTER_DATA_PATH}/departments`);
  redirect(`${MASTER_DATA_PATH}/departments`);
}

export async function deleteDepartmentAction(formData: FormData) {
  const user = await requirePermission("master.department");
  const id = requiredId(formData);
  const department = await getDepartment(id);

  await deleteDepartment(id);
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.DELETE,
    resource: "Department",
    resourceId: department.id,
    description: "Deleted department.",
    oldValues: department,
  });
  revalidatePath(`${MASTER_DATA_PATH}/departments`);
}

export async function createEmployeeAction(formData: FormData) {
  const user = await requirePermission("master.user");
  const employee = await createEmployee({
    employeeId: nullableStringValue(formData, "employeeId"),
    email: stringValue(formData, "email") ?? "",
    fullName: stringValue(formData, "fullName") ?? "",
    departmentId: stringValue(formData, "departmentId") ?? "",
    roleId: stringValue(formData, "roleId") ?? "",
    managerId: nullableStringValue(formData, "managerId"),
    status: (stringValue(formData, "status") as UserStatus) ?? UserStatus.ACTIVE,
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.CREATE,
    resource: "User",
    resourceId: employee.id,
    description: "Created user.",
    newValues: employee,
  });
  revalidatePath(`${MASTER_DATA_PATH}/employees`);
}

export async function updateEmployeeAction(formData: FormData) {
  const user = await requirePermission("master.user");
  const id = requiredId(formData);
  const oldEmployee = await getEmployee(id);

  const employee = await updateEmployee(id, {
    employeeId: nullableStringValue(formData, "employeeId"),
    email: stringValue(formData, "email"),
    fullName: stringValue(formData, "fullName"),
    departmentId: stringValue(formData, "departmentId"),
    roleId: stringValue(formData, "roleId"),
    managerId: nullableStringValue(formData, "managerId"),
    status: stringValue(formData, "status") as UserStatus | undefined,
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.UPDATE,
    resource: "User",
    resourceId: employee.id,
    description: "Updated user.",
    oldValues: oldEmployee,
    newValues: employee,
  });
  revalidatePath(`${MASTER_DATA_PATH}/employees`);
  redirect(`${MASTER_DATA_PATH}/employees`);
}

export async function deleteEmployeeAction(formData: FormData) {
  const user = await requirePermission("master.user");
  const id = requiredId(formData);
  const employee = await getEmployee(id);

  await deleteEmployee(id);
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.DELETE,
    resource: "User",
    resourceId: employee.id,
    description: "Deleted user.",
    oldValues: employee,
  });
  revalidatePath(`${MASTER_DATA_PATH}/employees`);
}

export async function createExpenseCategoryAction(formData: FormData) {
  const user = await requirePermission("master.category");
  const category = await createExpenseCategory({
    code: stringValue(formData, "code") ?? "",
    name: stringValue(formData, "name") ?? "",
    description: nullableStringValue(formData, "description"),
    isActive: formData.get("isActive") === "on",
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.CREATE,
    resource: "ReimbursementCategory",
    resourceId: category.id,
    description: "Created reimbursement category.",
    newValues: category,
  });
  revalidatePath(`${MASTER_DATA_PATH}/expense-categories`);
}

export async function updateExpenseCategoryAction(formData: FormData) {
  const user = await requirePermission("master.category");
  const id = requiredId(formData);
  const oldCategory = await getExpenseCategory(id);

  const category = await updateExpenseCategory(id, {
    code: stringValue(formData, "code"),
    name: stringValue(formData, "name"),
    description: nullableStringValue(formData, "description"),
    isActive: formData.get("isActive") === "on",
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.UPDATE,
    resource: "ReimbursementCategory",
    resourceId: category.id,
    description: "Updated reimbursement category.",
    oldValues: oldCategory,
    newValues: category,
  });
  revalidatePath(`${MASTER_DATA_PATH}/expense-categories`);
  redirect(`${MASTER_DATA_PATH}/expense-categories`);
}

export async function deleteExpenseCategoryAction(formData: FormData) {
  const user = await requirePermission("master.category");
  const id = requiredId(formData);
  const category = await getExpenseCategory(id);

  await deleteExpenseCategory(id);
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.DELETE,
    resource: "ReimbursementCategory",
    resourceId: category.id,
    description: "Deleted reimbursement category.",
    oldValues: category,
  });
  revalidatePath(`${MASTER_DATA_PATH}/expense-categories`);
}

export async function createRoleAction(formData: FormData) {
  const user = await requirePermission("master.role");
  const role = await createRole({
    name: stringValue(formData, "name") ?? "",
    description: nullableStringValue(formData, "description"),
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.CREATE,
    resource: "Role",
    resourceId: role.id,
    description: "Created role.",
    newValues: role,
  });
  revalidatePath(`${MASTER_DATA_PATH}/roles`);
}

export async function updateRoleAction(formData: FormData) {
  const user = await requirePermission("master.role");
  const id = requiredId(formData);
  const oldRole = await getRole(id);

  const role = await updateRole(id, {
    name: stringValue(formData, "name"),
    description: nullableStringValue(formData, "description"),
  });
  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.UPDATE,
    resource: "Role",
    resourceId: role.id,
    description: "Updated role.",
    oldValues: oldRole,
    newValues: role,
  });
  revalidatePath(`${MASTER_DATA_PATH}/roles`);
  redirect(`${MASTER_DATA_PATH}/roles`);
}

export async function updateRolePermissionsAction(formData: FormData) {
  const user = await requirePermission("master.role");
  const roleId = stringValue(formData, "roleId");

  if (!roleId) {
    throw new ValidationError("Role ID is required.");
  }

  const oldMatrix = await getRolePermissionMatrix(roleId);
  const role = await updateRolePermissions(
    roleId,
    {
      permissionIds: formData
        .getAll("permissionIds")
        .filter((value): value is string => typeof value === "string"),
    },
    user,
  );
  const newMatrix = await getRolePermissionMatrix(roleId);

  await recordMutationAuditLog({
    actor: user,
    action: AuditAction.UPDATE_PERMISSIONS,
    resource: "RolePermission",
    resourceId: roleId,
    description: "Updated role permissions.",
    oldValues: oldMatrix,
    newValues: newMatrix,
    metadata: {
      roleId: role.id,
      roleName: role.name,
    },
  });
  revalidatePath(`${MASTER_DATA_PATH}/role-permissions/${roleId}`);
  redirect(`${MASTER_DATA_PATH}/roles`);
}

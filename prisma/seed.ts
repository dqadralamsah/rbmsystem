import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { UserStatus } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const departments = [
  { code: "IT", name: "IT" },
  { code: "FIN", name: "Finance" },
  { code: "HR", name: "Human Resource" },
  { code: "MKT", name: "Marketing" },
] as const;

const roles = [
  { name: "Super Admin", description: "Full system access." },
  { name: "Requester", description: "Create and submit reimbursement claims." },
  { name: "Manager", description: "Review and approve subordinate claims." },
  { name: "Finance", description: "Verify claims and mark reimbursements as paid." },
] as const;

const permissions = [
  "dashboard.view",
  "reimbursement.create",
  "reimbursement.update",
  "reimbursement.submit",
  "approval.review",
  "approval.approve",
  "approval.return",
  "approval.reject",
  "finance.review",
  "finance.approve",
  "finance.return",
  "finance.reject",
  "finance.mark_paid",
  "master.user",
  "master.role",
  "master.department",
  "master.category",
  "settings.view",
] as const;

const rolePermissions = {
  Requester: [
    "dashboard.view",
    "reimbursement.create",
    "reimbursement.update",
    "reimbursement.submit",
  ],
  Manager: [
    "dashboard.view",
    "approval.review",
    "approval.approve",
    "approval.return",
    "approval.reject",
  ],
  Finance: [
    "dashboard.view",
    "finance.review",
    "finance.approve",
    "finance.return",
    "finance.reject",
    "finance.mark_paid",
  ],
  "Super Admin": permissions,
} as const;

const reimbursementCategories = [
  { code: "TRANSPORTATION", name: "Transportation" },
  { code: "HOTEL", name: "Hotel" },
  { code: "MEAL", name: "Meal" },
  { code: "MEDICAL", name: "Medical" },
  { code: "ENTERTAINMENT", name: "Entertainment" },
  { code: "OTHER", name: "Other" },
] as const;

function toPermissionName(code: string): string {
  return code
    .split(".")
    .join(" ")
    .split("_")
    .join(" ")
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function seedDepartments() {
  const records = await Promise.all(
    departments.map((department) =>
      prisma.department.upsert({
        where: { code: department.code },
        update: {
          name: department.name,
          deletedAt: null,
        },
        create: department,
      }),
    ),
  );

  return new Map(records.map((department) => [department.code, department]));
}

async function seedRoles() {
  const records = await Promise.all(
    roles.map((role) =>
      prisma.role.upsert({
        where: { name: role.name },
        update: {
          description: role.description,
          deletedAt: null,
        },
        create: role,
      }),
    ),
  );

  return new Map(records.map((role) => [role.name, role]));
}

async function seedPermissions() {
  const records = await Promise.all(
    permissions.map((code) =>
      prisma.permission.upsert({
        where: { code },
        update: {
          name: toPermissionName(code),
          description: null,
        },
        create: {
          code,
          name: toPermissionName(code),
        },
      }),
    ),
  );

  return new Map(records.map((permission) => [permission.code, permission]));
}

async function seedRolePermissions(
  roleMap: Awaited<ReturnType<typeof seedRoles>>,
  permissionMap: Awaited<ReturnType<typeof seedPermissions>>,
) {
  for (const [roleName, permissionCodes] of Object.entries(rolePermissions)) {
    const role = roleMap.get(roleName);

    if (!role) {
      throw new Error(`Role ${roleName} was not seeded.`);
    }

    for (const permissionCode of permissionCodes) {
      const permission = permissionMap.get(permissionCode);

      if (!permission) {
        throw new Error(`Permission ${permissionCode} was not seeded.`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}

async function seedReimbursementCategories() {
  await Promise.all(
    reimbursementCategories.map((category) =>
      prisma.reimbursementCategory.upsert({
        where: { code: category.code },
        update: {
          name: category.name,
          isActive: true,
          deletedAt: null,
        },
        create: {
          code: category.code,
          name: category.name,
          isActive: true,
        },
      }),
    ),
  );
}

async function seedUsers(
  departmentMap: Awaited<ReturnType<typeof seedDepartments>>,
  roleMap: Awaited<ReturnType<typeof seedRoles>>,
) {
  const itDepartment = departmentMap.get("IT");
  const financeDepartment = departmentMap.get("FIN");
  const marketingDepartment = departmentMap.get("MKT");
  const superAdminRole = roleMap.get("Super Admin");
  const requesterRole = roleMap.get("Requester");
  const managerRole = roleMap.get("Manager");
  const financeRole = roleMap.get("Finance");

  if (
    !itDepartment ||
    !financeDepartment ||
    !marketingDepartment ||
    !superAdminRole ||
    !requesterRole ||
    !managerRole ||
    !financeRole
  ) {
    throw new Error("Required user seed dependencies were not created.");
  }

  await prisma.user.upsert({
    where: { email: "admin@rbmsystem.test" },
    update: {
      employeeId: "EMP-000",
      fullName: "System Administrator",
      departmentId: itDepartment.id,
      roleId: superAdminRole.id,
      managerId: null,
      status: UserStatus.ACTIVE,
      deletedAt: null,
    },
    create: {
      employeeId: "EMP-000",
      email: "admin@rbmsystem.test",
      fullName: "System Administrator",
      departmentId: itDepartment.id,
      roleId: superAdminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "michael.johnson@rbmsystem.test" },
    update: {
      employeeId: "EMP-200",
      fullName: "Michael Johnson",
      departmentId: marketingDepartment.id,
      roleId: managerRole.id,
      managerId: null,
      status: UserStatus.ACTIVE,
      deletedAt: null,
    },
    create: {
      employeeId: "EMP-200",
      email: "michael.johnson@rbmsystem.test",
      fullName: "Michael Johnson",
      departmentId: marketingDepartment.id,
      roleId: managerRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: "john.doe@rbmsystem.test" },
    update: {
      employeeId: "EMP-100",
      fullName: "John Doe",
      departmentId: marketingDepartment.id,
      roleId: requesterRole.id,
      managerId: manager.id,
      status: UserStatus.ACTIVE,
      deletedAt: null,
    },
    create: {
      employeeId: "EMP-100",
      email: "john.doe@rbmsystem.test",
      fullName: "John Doe",
      departmentId: marketingDepartment.id,
      roleId: requesterRole.id,
      managerId: manager.id,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: "sarah.williams@rbmsystem.test" },
    update: {
      employeeId: "EMP-300",
      fullName: "Sarah Williams",
      departmentId: financeDepartment.id,
      roleId: financeRole.id,
      managerId: null,
      status: UserStatus.ACTIVE,
      deletedAt: null,
    },
    create: {
      employeeId: "EMP-300",
      email: "sarah.williams@rbmsystem.test",
      fullName: "Sarah Williams",
      departmentId: financeDepartment.id,
      roleId: financeRole.id,
      status: UserStatus.ACTIVE,
    },
  });

}

async function main() {
  const departmentMap = await seedDepartments();
  const roleMap = await seedRoles();
  const permissionMap = await seedPermissions();

  await seedRolePermissions(roleMap, permissionMap);
  await seedReimbursementCategories();
  await seedUsers(departmentMap, roleMap);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

import "server-only";

import { UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { CurrentUser, DevelopmentLoginUser } from "@/modules/auth/types";

export async function findActiveUsersForDevelopmentLogin(): Promise<
  DevelopmentLoginUser[]
> {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      status: UserStatus.ACTIVE,
      department: {
        deletedAt: null,
      },
      role: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      department: {
        select: {
          name: true,
        },
      },
      role: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return users.map((user) => ({
    id: user.id,
    employeeId: user.employeeId,
    fullName: user.fullName,
    role: user.role.name,
    department: user.department.name,
  }));
}

export async function findActiveUserSessionById(
  userId: string,
): Promise<CurrentUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      status: UserStatus.ACTIVE,
      department: {
        deletedAt: null,
      },
      role: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      departmentId: true,
      roleId: true,
      department: {
        select: {
          code: true,
          name: true,
        },
      },
      role: {
        select: {
          name: true,
          permissions: {
            select: {
              permission: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    employeeId: user.employeeId,
    fullName: user.fullName,
    role: user.role.name,
    roleId: user.roleId,
    departmentId: user.departmentId,
    departmentName: user.department.name,
    departmentCode: user.department.code,
    permissions: user.role.permissions.map(
      (rolePermission) => rolePermission.permission.code,
    ),
  };
}

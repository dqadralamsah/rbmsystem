import "server-only";

import { UserStatus } from "@/generated/prisma/enums";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { createPaginationMeta } from "@/lib/api";
import * as employeeRepository from "@/modules/master-data/employees/repositories/employee.repository";
import type {
  CreateEmployeeInput,
  EmployeeListParams,
  UpdateEmployeeInput,
} from "@/modules/master-data/employees/types";

export async function listEmployees(params: EmployeeListParams) {
  const [employees, totalItems] = await Promise.all([
    employeeRepository.findEmployees(params),
    employeeRepository.countEmployees(params.search),
  ]);

  return {
    data: employees,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getEmployee(id: string) {
  const employee = await employeeRepository.findEmployeeById(id);

  if (!employee) {
    throw new NotFoundError("Employee was not found.");
  }

  return employee;
}

async function validateEmployeeDependencies(input: {
  departmentId?: string;
  roleId?: string;
  managerId?: string | null;
}) {
  if (input.departmentId) {
    const department = await employeeRepository.findDepartmentById(
      input.departmentId,
    );

    if (!department) {
      throw new ValidationError("Department was not found.");
    }
  }

  if (input.roleId) {
    const role = await employeeRepository.findRoleById(input.roleId);

    if (!role) {
      throw new ValidationError("Role was not found.");
    }
  }

  if (input.managerId) {
    const manager = await employeeRepository.findEmployeeById(input.managerId);

    if (!manager) {
      throw new ValidationError("Manager was not found.");
    }
  }
}

async function validateEmployeeUniqueFields(
  input: {
    email?: string;
    employeeId?: string | null;
  },
  excludeId?: string,
) {
  if (input.email) {
    const existingEmail = await employeeRepository.findEmployeeByEmail(
      input.email,
      excludeId,
    );

    if (existingEmail) {
      throw new ConflictError("Employee email already exists.");
    }
  }

  if (input.employeeId) {
    const existingEmployeeId =
      await employeeRepository.findEmployeeByEmployeeId(
        input.employeeId,
        excludeId,
      );

    if (existingEmployeeId) {
      throw new ConflictError("Employee ID already exists.");
    }
  }
}

export async function createEmployee(input: CreateEmployeeInput) {
  await validateEmployeeDependencies(input);
  await validateEmployeeUniqueFields(input);

  return employeeRepository.createEmployee({
    ...input,
    status: input.status ?? UserStatus.ACTIVE,
  });
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  await getEmployee(id);

  if (input.managerId === id) {
    throw new ValidationError("Employee cannot be their own manager.");
  }

  await validateEmployeeDependencies(input);
  await validateEmployeeUniqueFields(input, id);

  return employeeRepository.updateEmployee(id, input);
}

export async function deleteEmployee(id: string) {
  await getEmployee(id);
  await employeeRepository.softDeleteEmployee(id);
}

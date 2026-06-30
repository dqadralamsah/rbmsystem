import "server-only";

import {
  ConflictError,
  NotFoundError,
} from "@/lib/errors";
import {
  createPaginationMeta,
} from "@/lib/api";
import * as departmentRepository from "@/modules/master-data/departments/repositories/department.repository";
import type {
  CreateDepartmentInput,
  DepartmentListParams,
  UpdateDepartmentInput,
} from "@/modules/master-data/departments/types";

export async function listDepartments(params: DepartmentListParams) {
  const [departments, totalItems] = await Promise.all([
    departmentRepository.findDepartments(params),
    departmentRepository.countDepartments(params.search),
  ]);

  return {
    data: departments,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getDepartment(id: string) {
  const department = await departmentRepository.findDepartmentById(id);

  if (!department) {
    throw new NotFoundError("Department was not found.");
  }

  return department;
}

export async function createDepartment(input: CreateDepartmentInput) {
  const existingDepartment = await departmentRepository.findDepartmentByCode(
    input.code,
  );

  if (existingDepartment) {
    throw new ConflictError("Department code already exists.");
  }

  return departmentRepository.createDepartment(input);
}

export async function updateDepartment(
  id: string,
  input: UpdateDepartmentInput,
) {
  await getDepartment(id);

  if (input.code) {
    const existingDepartment = await departmentRepository.findDepartmentByCode(
      input.code,
      id,
    );

    if (existingDepartment) {
      throw new ConflictError("Department code already exists.");
    }
  }

  return departmentRepository.updateDepartment(id, input);
}

export async function deleteDepartment(id: string) {
  await getDepartment(id);
  await departmentRepository.softDeleteDepartment(id);
}

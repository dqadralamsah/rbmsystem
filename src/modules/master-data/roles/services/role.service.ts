import "server-only";

import { createPaginationMeta } from "@/lib/api";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import * as roleRepository from "@/modules/master-data/roles/repositories/role.repository";
import type {
  CreateRoleInput,
  RoleListParams,
  UpdateRoleInput,
} from "@/modules/master-data/roles/types";

const SYSTEM_ROLE_NAMES = [
  "Super Admin",
  "Requester",
  "Manager",
  "Finance",
] as const;

function isSystemRole(roleName: string) {
  return SYSTEM_ROLE_NAMES.some((systemRoleName) => systemRoleName === roleName);
}

export async function listRoles(params: RoleListParams) {
  const [roles, totalItems] = await Promise.all([
    roleRepository.findRoles(params),
    roleRepository.countRoles(params.search),
  ]);

  return {
    data: roles,
    meta: createPaginationMeta(params.pagination, totalItems),
  };
}

export async function getRole(id: string) {
  const role = await roleRepository.findRoleById(id);

  if (!role) {
    throw new NotFoundError("Role was not found.");
  }

  return role;
}

export async function createRole(input: CreateRoleInput) {
  const existingRole = await roleRepository.findRoleByName(input.name);

  if (existingRole) {
    throw new ConflictError("Role name already exists.");
  }

  return roleRepository.createRole(input);
}

export async function updateRole(id: string, input: UpdateRoleInput) {
  const role = await getRole(id);

  if (isSystemRole(role.name)) {
    throw new ValidationError("Built-in system roles cannot be edited.");
  }

  if (input.name) {
    const existingRole = await roleRepository.findRoleByName(input.name, id);

    if (existingRole) {
      throw new ConflictError("Role name already exists.");
    }
  }

  return roleRepository.updateRole(id, input);
}

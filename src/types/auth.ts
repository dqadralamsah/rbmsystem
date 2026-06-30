export enum AuthRole {
  ADMIN = "Super Admin",
  REQUESTER = "Requester",
  MANAGER = "Manager",
  FINANCE = "Finance",
}

export type PermissionCode = string;

export interface AuthSession {
  userId: string;
  employeeId: string | null;
  fullName: string;
  role: string;
  departmentId: string;
}

export interface CurrentUser extends AuthSession {
  roleId: string;
  departmentName: string;
  departmentCode: string;
  permissions: PermissionCode[];
}

export interface DevelopmentLoginUser {
  id: string;
  employeeId: string | null;
  fullName: string;
  role: string;
  department: string;
}

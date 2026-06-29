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
  permissions: string[];
}

export interface DevelopmentLoginUser {
  id: string;
  employeeId: string | null;
  fullName: string;
  role: string;
  department: string;
}

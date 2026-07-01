import type { PaginationInput } from "@/types/api";

export interface PermissionListParams {
  search?: string;
  pagination: PaginationInput;
}

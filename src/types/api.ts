export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<TData, TMeta = undefined> {
  success: true;
  message?: string;
  data: TData;
  meta?: TMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export interface PaginationInput {
  page: number;
  pageSize: number;
}

export interface PaginationMeta extends PaginationInput {
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PrismaPagination {
  skip: number;
  take: number;
}

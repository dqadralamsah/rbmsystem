import type {
  PaginationInput,
  PaginationMeta,
  PrismaPagination,
} from "@/types/api";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

export function parsePagination(searchParams: URLSearchParams): PaginationInput {
  const page = parsePositiveInteger(searchParams.get("page"), DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInteger(
    searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );

  return {
    page,
    pageSize: Math.min(requestedPageSize, MAX_PAGE_SIZE),
  };
}

export function toPrismaPagination({
  page,
  pageSize,
}: PaginationInput): PrismaPagination {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function createPaginationMeta(
  pagination: PaginationInput,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(Math.ceil(totalItems / pagination.pageSize), 1);

  return {
    ...pagination,
    totalItems,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}

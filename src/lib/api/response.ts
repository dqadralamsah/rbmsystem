import { NextResponse } from "next/server";

import type {
  ApiErrorBody,
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginationMeta,
} from "@/types/api";

export function apiSuccess<TData, TMeta = undefined>(
  data: TData,
  init?: {
    message?: string;
    meta?: TMeta;
    status?: number;
  },
) {
  const body: ApiSuccessResponse<TData, TMeta> = {
    success: true,
    data,
    ...(init?.message ? { message: init.message } : {}),
    ...(init?.meta ? { meta: init.meta } : {}),
  };

  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function apiCreated<TData>(data: TData, message = "Created.") {
  return apiSuccess(data, { message, status: 201 });
}

export function apiNoContent() {
  return new NextResponse(null, { status: 204 });
}

export function apiPaginated<TData>(
  data: TData,
  meta: PaginationMeta,
  message?: string,
) {
  return apiSuccess(data, { message, meta });
}

export function apiError(error: ApiErrorBody, status = 500) {
  const body: ApiErrorResponse = {
    success: false,
    error,
  };

  return NextResponse.json(body, { status });
}

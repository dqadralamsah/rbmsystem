import { ZodError } from "zod";

import { apiError } from "@/lib/api/response";
import { AppError, ValidationError } from "@/lib/errors";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiError(
      {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      error.statusCode,
    );
  }

  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      "Request validation failed.",
      error.flatten(),
    );

    return apiError(
      {
        code: validationError.code,
        message: validationError.message,
        details: validationError.details,
      },
      validationError.statusCode,
    );
  }

  return apiError(
    {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
    500,
  );
}

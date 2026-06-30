import { z } from "zod";

import { ValidationError } from "@/lib/errors";

export async function validateRequestBody<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }

  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ValidationError(
      "Request body validation failed.",
      result.error.flatten(),
    );
  }

  return result.data;
}

export function validateSearchParams<TSchema extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: TSchema,
): z.infer<TSchema> {
  const result = schema.safeParse(Object.fromEntries(searchParams));

  if (!result.success) {
    throw new ValidationError(
      "Request query validation failed.",
      result.error.flatten(),
    );
  }

  return result.data;
}

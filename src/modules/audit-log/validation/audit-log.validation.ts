import { z } from "zod";

import { AuditAction } from "@/generated/prisma/enums";

const auditActionValues = Object.values(AuditAction) as [
  AuditAction,
  ...AuditAction[],
];

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

function optionalDateSchema(options?: { endOfDay?: boolean }) {
  return z
  .string()
  .trim()
  .optional()
  .transform((value, context) => {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Invalid date format.",
      });

      return z.NEVER;
    }

    if (options?.endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      date.setHours(23, 59, 59, 999);
    }

    return date;
  });
}

export const auditLogListQuerySchema = z.object({
  search: optionalTextSchema,
  action: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(auditActionValues).optional(),
  ),
  resource: optionalTextSchema,
  actorId: optionalTextSchema,
  dateFrom: optionalDateSchema(),
  dateTo: optionalDateSchema({ endOfDay: true }),
});

export type AuditLogListQueryInput = z.infer<typeof auditLogListQuerySchema>;

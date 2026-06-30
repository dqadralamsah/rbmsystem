import { ReimbursementStatus } from "@/generated/prisma/enums";

export function formatCurrency(value: { toString(): string } | string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value.toString()));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getDisplayNumber(number: string, status: ReimbursementStatus) {
  if (status === ReimbursementStatus.DRAFT) {
    return "Draft";
  }

  return number;
}

export function getStatusLabel(status: ReimbursementStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function getStatusVariant(status: ReimbursementStatus) {
  switch (status) {
    case ReimbursementStatus.DRAFT:
      return "muted";
    case ReimbursementStatus.SUBMITTED:
    case ReimbursementStatus.APPROVED_BY_MANAGER:
    case ReimbursementStatus.APPROVED_BY_FINANCE:
      return "warning";
    case ReimbursementStatus.PAID:
    case ReimbursementStatus.COMPLETED:
      return "success";
    case ReimbursementStatus.RETURNED_BY_MANAGER:
    case ReimbursementStatus.RETURNED_BY_FINANCE:
      return "outline";
    case ReimbursementStatus.REJECTED_BY_MANAGER:
    case ReimbursementStatus.REJECTED_BY_FINANCE:
      return "danger";
    default:
      return "default";
  }
}

export function getLatestReturnHistory<
  THistory extends {
    action: string;
    notes: string | null;
  },
>(histories: THistory[]) {
  return histories.filter((history) => history.action === "RETURN").at(-1);
}

import type { ReimbursementStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import {
  getStatusLabel,
  getStatusVariant,
} from "@/modules/reimbursement/components/reimbursement-display";

interface ReimbursementStatusBadgeProps {
  status: ReimbursementStatus;
}

export function ReimbursementStatusBadge({
  status,
}: ReimbursementStatusBadgeProps) {
  return (
    <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
  );
}

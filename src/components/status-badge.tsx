import type { RequestStatus } from "@/generated/prisma/enums";
import { STATUS_LABELS, STATUS_TONES } from "@/lib/status";
import { Badge } from "./ui/badge";

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}

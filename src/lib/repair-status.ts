import type { RepairStatus } from "@/lib/db";

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: "در انتظار بررسی",
  checking: "در حال بررسی",
  repairing: "در حال تعمیر",
  completed: "آماده تحویل",
};

export function getRepairStatusLabel(status: string): string {
  return REPAIR_STATUS_LABELS[status as RepairStatus] ?? status;
}

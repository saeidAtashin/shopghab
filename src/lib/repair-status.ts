export type RepairStatus = "pending" | "checking" | "repairing" | "completed";

export type BackendRepairStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "WAITING_FOR_PART"
  | "DONE"
  | "DELIVERED"
  | "CANCELED";

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: "در انتظار بررسی",
  checking: "در حال بررسی",
  repairing: "در حال تعمیر",
  completed: "آماده تحویل",
};

export const BACKEND_REPAIR_STATUS_LABELS: Record<BackendRepairStatus, string> =
  {
    PENDING: "در انتظار بررسی",
    ACCEPTED: "پذیرفته شده",
    IN_PROGRESS: "در حال تعمیر",
    WAITING_FOR_PART: "در انتظار قطعه",
    DONE: "تعمیر انجام شد",
    DELIVERED: "تحویل داده شد",
    CANCELED: "لغو شده",
  };

export const BACKEND_REPAIR_STATUSES = Object.keys(
  BACKEND_REPAIR_STATUS_LABELS,
) as BackendRepairStatus[];

export function getRepairStatusLabel(status: string): string {
  if (status in BACKEND_REPAIR_STATUS_LABELS) {
    return BACKEND_REPAIR_STATUS_LABELS[status as BackendRepairStatus];
  }

  return REPAIR_STATUS_LABELS[status as RepairStatus] ?? status;
}

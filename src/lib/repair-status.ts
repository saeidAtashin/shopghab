import type { OrderStatus } from "@/lib/db";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار بررسی",
  reviewing: "در حال بررسی",
  producing: "در حال تولید",
  ready: "آماده ارسال",
  completed: "تحویل شده",
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

/** @deprecated Use getOrderStatusLabel */
export const getRepairStatusLabel = getOrderStatusLabel;
/** @deprecated Use ORDER_STATUS_LABELS */
export const REPAIR_STATUS_LABELS = ORDER_STATUS_LABELS;

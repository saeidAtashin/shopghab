import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type OrderStatus =
  | "pending"
  | "reviewing"
  | "producing"
  | "ready"
  | "completed";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "reviewing",
  "producing",
  "ready",
  "completed",
];

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

/** @deprecated Use OrderStatus */
export type RepairStatus = OrderStatus;
/** @deprecated Use ORDER_STATUSES */
export const REPAIR_STATUSES = ORDER_STATUSES;
/** @deprecated Use isOrderStatus */
export const isRepairStatus = isOrderStatus;

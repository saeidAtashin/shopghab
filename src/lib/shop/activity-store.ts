import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  emptyShopActivity,
  toPublicOrder,
  type PaymentMethod,
  type PublicShopOrder,
  type ShopActivity,
  type ShopActivityOrder,
  type ShopOrderStatus,
} from "./activity";
import type { CartLineItem } from "./types";

type OrderDraft = {
  id?: string;
  orderCode?: string;
  name: string;
  phone: string;
  address: string;
  note?: string;
  items: CartLineItem[];
  amount: number;
  paymentMethod: PaymentMethod;
  status: ShopOrderStatus;
  receiptFile?: string;
};

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => T): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function shopActivityPath(): string {
  return join(process.cwd(), "data", "shop-activity.json");
}

export function receiptsDir(): string {
  return join(process.cwd(), "data", "receipts");
}

function isPresence(value: unknown): value is ShopActivity["presence"][number] {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.phone === "string" &&
    typeof entry.name === "string" &&
    typeof entry.firstSeenAt === "string" &&
    typeof entry.lastSeenAt === "string"
  );
}

function isOrder(value: unknown): value is ShopActivityOrder {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.orderCode === "string" &&
    typeof entry.phone === "string" &&
    typeof entry.createdAt === "string" &&
    Array.isArray(entry.items)
  );
}

export function readShopActivity(): ShopActivity {
  const file = shopActivityPath();
  if (!existsSync(file)) return emptyShopActivity();
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<ShopActivity>;
    return {
      presence: Array.isArray(parsed.presence) ? parsed.presence.filter(isPresence) : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders.filter(isOrder) : [],
    };
  } catch {
    return emptyShopActivity();
  }
}

function writeShopActivity(activity: ShopActivity): void {
  const file = shopActivityPath();
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(activity, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
}

function orderCode(): string {
  return `SG${randomBytes(4).toString("hex").toUpperCase()}`;
}

function buildOrder(draft: OrderDraft, now = new Date()): ShopActivityOrder {
  return {
    id: draft.id?.trim() || randomUUID(),
    orderCode: draft.orderCode?.trim() || orderCode(),
    name: draft.name,
    phone: draft.phone,
    address: draft.address,
    note: draft.note,
    items: draft.items,
    amount: draft.amount,
    paymentMethod: draft.paymentMethod,
    status: draft.status,
    receiptFile: draft.receiptFile,
    createdAt: now.toISOString(),
  };
}

export function touchPresence(phone: string, name: string, now = new Date()): Promise<void> {
  return enqueue(() => {
    const activity = readShopActivity();
    const iso = now.toISOString();
    const trimmedName = name.trim() || phone;
    const existing = activity.presence.find((entry) => entry.phone === phone);
    if (existing) {
      existing.lastSeenAt = iso;
      existing.name = trimmedName;
    } else {
      activity.presence.push({
        phone,
        name: trimmedName,
        firstSeenAt: iso,
        lastSeenAt: iso,
      });
    }
    writeShopActivity(activity);
  });
}

export function recordShopOrder(draft: OrderDraft): Promise<PublicShopOrder> {
  return enqueue(() => {
    const activity = readShopActivity();
    if (draft.id) {
      const existing = activity.orders.find((order) => order.id === draft.id);
      if (existing) return toPublicOrder(existing);
    }
    const order = buildOrder(draft);
    activity.orders.unshift(order);
    writeShopActivity(activity);
    return toPublicOrder(order);
  });
}

export function createCardOrder(
  draft: Omit<OrderDraft, "paymentMethod" | "status" | "receiptFile" | "id" | "orderCode">,
  bytes: Uint8Array,
  ext: "jpg" | "png" | "webp",
): Promise<PublicShopOrder> {
  return enqueue(() => {
    const order = buildOrder({
      ...draft,
      paymentMethod: "card_to_card",
      status: "receipt_uploaded",
      receiptFile: "pending",
    });
    const filename = `${order.id}.${ext}`;
    order.receiptFile = filename;
    const dir = receiptsDir();
    mkdirSync(dir, { recursive: true });
    const filePath = join(dir, filename);
    writeFileSync(filePath, bytes);
    try {
      const activity = readShopActivity();
      activity.orders.unshift(order);
      writeShopActivity(activity);
    } catch (error) {
      if (existsSync(filePath)) unlinkSync(filePath);
      throw error;
    }
    return toPublicOrder(order);
  });
}

export function confirmShopOrder(id: string): Promise<PublicShopOrder | null> {
  return enqueue(() => {
    const activity = readShopActivity();
    const order = activity.orders.find((entry) => entry.id === id);
    if (!order || order.status !== "receipt_uploaded") return null;
    order.status = "confirmed";
    writeShopActivity(activity);
    return toPublicOrder(order);
  });
}

export type ShopOrderTracking = {
  orderCode: string;
  status: ShopOrderStatus;
  createdAt: string;
  summary: string;
};

export function findShopOrderTracking(code: string): ShopOrderTracking | null {
  const wanted = code.trim().toUpperCase();
  if (!wanted) return null;
  const order = readShopActivity().orders.find((entry) => entry.orderCode.toUpperCase() === wanted);
  if (!order) return null;
  const summary = order.items
    .map((item) => (item.kind === "custom" ? item.title.trim() : "قاب آماده"))
    .filter((title) => title.length > 0)
    .join("، ");
  return {
    orderCode: order.orderCode,
    status: order.status,
    createdAt: order.createdAt,
    summary: summary || "قاب موبایل",
  };
}

export function readOrderReceipt(id: string): { bytes: Buffer; ext: string } | null {
  const order = readShopActivity().orders.find((entry) => entry.id === id);
  if (!order?.receiptFile) return null;
  if (!/^[\w.-]+$/.test(order.receiptFile) || order.receiptFile.includes("..")) return null;
  const filePath = join(receiptsDir(), order.receiptFile);
  if (!existsSync(filePath)) return null;
  const ext = order.receiptFile.split(".").pop() ?? "jpg";
  return { bytes: readFileSync(filePath), ext };
}

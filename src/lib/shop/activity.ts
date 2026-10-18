import { getCartSubtotal } from "./cart";
import { ONLINE_WINDOW_MS } from "./presence";
import { normalizeCartItem, type CartLineItem } from "./types";
import { normalizeIranPhone } from "@/lib/phone";

export { ONLINE_WINDOW_MS, PRESENCE_INTERVAL_MS } from "./presence";

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

export const CARD_TO_CARD = {
  holder: "سعید کاسه آتشین",
  number: "6219861904903001",
} as const;

export type PaymentMethod = "zarinpal" | "card_to_card";
export type ShopOrderStatus = "paid" | "receipt_uploaded" | "confirmed";

export type PresenceRecord = {
  phone: string;
  name: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type ShopActivityOrder = {
  id: string;
  orderCode: string;
  name: string;
  phone: string;
  address: string;
  note?: string;
  items: CartLineItem[];
  amount: number;
  paymentMethod: PaymentMethod;
  status: ShopOrderStatus;
  receiptFile?: string;
  createdAt: string;
};

export type ShopActivity = {
  presence: PresenceRecord[];
  orders: ShopActivityOrder[];
};

export type PublicShopOrder = Omit<ShopActivityOrder, "receiptFile"> & {
  hasReceipt: boolean;
};

export type AdminCustomer = {
  phone: string;
  name: string;
  online: boolean;
  lastSeenAt: string | null;
  orders: PublicShopOrder[];
};

export type ParsedOrderFields = {
  name: string;
  phone: string;
  address: string;
  note?: string;
  items: CartLineItem[];
  amount: number;
};

export function formatCardNumber(number: string): string {
  return number.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function emptyShopActivity(): ShopActivity {
  return { presence: [], orders: [] };
}

export function isOnline(lastSeenAt: string, now = Date.now()): boolean {
  const seen = Date.parse(lastSeenAt);
  return Number.isFinite(seen) && now - seen <= ONLINE_WINDOW_MS;
}

export function receiptExtension(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes.length < 12 || bytes.length > RECEIPT_MAX_BYTES) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export function receiptContentType(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export function toPublicOrder(order: ShopActivityOrder): PublicShopOrder {
  const { receiptFile: _receiptFile, ...rest } = order;
  return { ...rest, hasReceipt: Boolean(order.receiptFile) };
}

export function parseOrderFields(input: {
  name: unknown;
  phone: unknown;
  address: unknown;
  note: unknown;
  items: unknown;
}): ParsedOrderFields | { error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length > 80) {
    return { error: "نام و نام خانوادگی الزامی است." };
  }

  const phone = typeof input.phone === "string" ? normalizeIranPhone(input.phone) : null;
  if (!phone) {
    return { error: "شماره موبایل معتبر نیست." };
  }

  const address = typeof input.address === "string" ? input.address.trim() : "";
  if (!address || address.length > 500) {
    return { error: "آدرس ارسال الزامی است." };
  }

  const noteRaw = typeof input.note === "string" ? input.note.trim() : "";
  if (noteRaw.length > 500) {
    return { error: "یادداشت بیش از حد طولانی است." };
  }

  let itemsRaw: unknown = input.items;
  if (typeof itemsRaw === "string") {
    try {
      itemsRaw = JSON.parse(itemsRaw) as unknown;
    } catch {
      return { error: "اقلام سفارش معتبر نیست." };
    }
  }
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0 || itemsRaw.length > 50) {
    return { error: "سبد خرید خالی است." };
  }

  const items: CartLineItem[] = [];
  for (const entry of itemsRaw) {
    const item = normalizeCartItem(entry);
    if (!item) return { error: "اقلام سفارش معتبر نیست." };
    items.push(item);
  }

  return {
    name,
    phone,
    address,
    note: noteRaw || undefined,
    items,
    amount: getCartSubtotal(items),
  };
}

export function orderFieldsError(
  parsed: ParsedOrderFields | { error: string },
): parsed is { error: string } {
  return "error" in parsed;
}

function customerName(phone: string, presence: PresenceRecord | undefined, orders: ShopActivityOrder[]): string {
  const fromOrder = orders.find((order) => order.name.trim() && order.name.trim() !== phone)?.name;
  if (fromOrder) return fromOrder;
  if (presence?.name && presence.name !== phone) return presence.name;
  return orders[0]?.name || presence?.name || phone;
}

export function buildAdminCustomers(activity: ShopActivity, now = Date.now()): AdminCustomer[] {
  const ordersByPhone = new Map<string, ShopActivityOrder[]>();
  for (const order of activity.orders) {
    const list = ordersByPhone.get(order.phone) ?? [];
    list.push(order);
    ordersByPhone.set(order.phone, list);
  }

  const presenceByPhone = new Map(activity.presence.map((entry) => [entry.phone, entry]));
  const phones = new Set<string>();

  for (const order of activity.orders) phones.add(order.phone);
  for (const entry of activity.presence) {
    if (isOnline(entry.lastSeenAt, now)) phones.add(entry.phone);
  }

  const customers = [...phones].map((phone) => {
    const presence = presenceByPhone.get(phone);
    const orders = (ordersByPhone.get(phone) ?? [])
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      phone,
      name: customerName(phone, presence, orders),
      online: presence ? isOnline(presence.lastSeenAt, now) : false,
      lastSeenAt: presence?.lastSeenAt ?? null,
      orders: orders.map(toPublicOrder),
    };
  });

  customers.sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    const aTime = a.orders[0]?.createdAt ?? a.lastSeenAt ?? "";
    const bTime = b.orders[0]?.createdAt ?? b.lastSeenAt ?? "";
    return bTime.localeCompare(aTime);
  });

  return customers;
}

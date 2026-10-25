export type ReadyCartLineItem = {
  kind: "ready";
  productId: string;
  qty: number;
};

export type CustomCartLineItem = {
  kind: "custom";
  designId: string;
  previewUrl: string;
  qty: number;
  unitPrice: number;
  title: string;
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  description?: string;
};

export type CatalogCartLineItem = {
  kind: "catalog";
  templateSlug: string;
  previewUrl: string;
  qty: number;
  unitPrice: number;
  title: string;
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
};

export type CartLineItem = ReadyCartLineItem | CustomCartLineItem | CatalogCartLineItem;

/** Legacy console shop types (kept for unused modules) */
export const SHOP_CONSOLES = ["ps4", "ps5", "xbox-one", "xbox-series"] as const;
export type ShopConsole = (typeof SHOP_CONSOLES)[number];
export type ProductCondition = "new" | "used";
export type ProductCategory = "console" | "tools" | "accessories";

export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  console: ShopConsole;
  category: ProductCategory;
  condition: ProductCondition;
  price: number;
  compareAtPrice?: number;
  image: string;
  storage?: string;
  edition?: string;
  inStock: boolean;
  badges?: string[];
  highlights?: string[];
  searchTerms?: string[];
};

export type ProductSpec = { label: string; value: string };
export type ProductFeature = { title: string; description: string };
export type ProductFaq = { question: string; answer: string };

export type ShopProductDetail = {
  summary: string;
  overview: string[];
  features: ProductFeature[];
  specifications: ProductSpec[];
  whatsInBox?: string[];
  warranty: { title: string; items: string[] };
  delivery: { title: string; items: string[] };
  faqs: ProductFaq[];
  compatibility?: string[];
};

export type ShopOrderPayload = {
  name: string;
  phone: string;
  address?: string;
  note?: string;
  items: CartLineItem[];
};

export type ShopOrderResponse = {
  orderId: string;
  orderCode: string;
  amount: number;
};

export function getCartItemKey(item: CartLineItem): string {
  if (item.kind === "ready") return `ready:${item.productId}`;
  if (item.kind === "catalog") {
    return `catalog:${item.templateSlug}:${item.brandSlug}:${item.modelSlug}:${item.caseTypeSlug}`;
  }
  return `custom:${item.designId}`;
}

export function isReadyCartItem(item: CartLineItem): item is ReadyCartLineItem {
  return item.kind === "ready";
}

export function isCustomCartItem(item: CartLineItem): item is CustomCartLineItem {
  return item.kind === "custom";
}

export function isCatalogCartItem(item: CartLineItem): item is CatalogCartLineItem {
  return item.kind === "catalog";
}

/** Migrate legacy cart items without kind field */
export function normalizeCartItem(item: unknown): CartLineItem | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;
  if (typeof obj.qty !== "number" || !Number.isInteger(obj.qty) || obj.qty <= 0) return null;

  if (obj.kind === "ready" && typeof obj.productId === "string") {
    return { kind: "ready", productId: obj.productId, qty: obj.qty };
  }
  if (obj.kind === "custom" && typeof obj.designId === "string") {
    return {
      kind: "custom",
      designId: obj.designId,
      previewUrl: String(obj.previewUrl ?? ""),
      qty: obj.qty,
      unitPrice: Number(obj.unitPrice) || 0,
      title: String(obj.title ?? "قاب سفارشی"),
      brandSlug: String(obj.brandSlug ?? ""),
      modelSlug: String(obj.modelSlug ?? ""),
      caseTypeSlug: String(obj.caseTypeSlug ?? ""),
      description: obj.description ? String(obj.description) : undefined,
    };
  }
  if (
    obj.kind === "catalog" &&
    typeof obj.templateSlug === "string" &&
    obj.templateSlug.length > 0 &&
    typeof obj.brandSlug === "string" &&
    typeof obj.modelSlug === "string" &&
    typeof obj.caseTypeSlug === "string"
  ) {
    return {
      kind: "catalog",
      templateSlug: obj.templateSlug,
      previewUrl: String(obj.previewUrl ?? ""),
      qty: obj.qty,
      unitPrice: Number(obj.unitPrice) || 0,
      title: String(obj.title ?? "طرح پیش‌ساخته"),
      brandSlug: obj.brandSlug,
      modelSlug: obj.modelSlug,
      caseTypeSlug: obj.caseTypeSlug,
    };
  }
  if (typeof obj.productId === "string") {
    return { kind: "ready", productId: obj.productId, qty: obj.qty };
  }
  return null;
}

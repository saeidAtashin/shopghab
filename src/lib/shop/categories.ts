import type { ProductCategory } from "./types";

export const PRODUCT_CATEGORY_ORDER: ProductCategory[] = [
  "console",
  "tools",
  "accessories",
];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  console: "کنسول",
  tools: "ابزار و تجهیزات",
  accessories: "لوازم جانبی",
};

export const PRODUCT_CATEGORY_SHORT_LABELS: Record<
  Exclude<ProductCategory, "console">,
  string
> = {
  tools: "ابزار",
  accessories: "لوازم جانبی",
};

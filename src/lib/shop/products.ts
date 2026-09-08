import { PRODUCT_CATEGORY_ORDER } from "./categories";
import { STATIC_SHOP_PRODUCTS } from "./products.static";
import type {
  ProductCategory,
  ProductCondition,
  ShopConsole,
  ShopProduct,
} from "./types";

export type ProductFilters = {
  console?: ShopConsole;
  category?: ProductCategory;
  condition?: ProductCondition;
  inStockOnly?: boolean;
};

function matchesProductFilters(
  product: ShopProduct,
  filters: ProductFilters,
): boolean {
  if (filters.console && product.console !== filters.console) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.condition && product.condition !== filters.condition) return false;
  if (filters.inStockOnly && !product.inStock) return false;
  return true;
}

export function getProducts(filters: ProductFilters = {}): ShopProduct[] {
  return STATIC_SHOP_PRODUCTS.filter((product) =>
    matchesProductFilters(product, filters),
  );
}

export function getProductsGrouped(
  filters: Omit<ProductFilters, "category"> = {},
): Record<ProductCategory, ShopProduct[]> {
  const grouped = Object.fromEntries(
    PRODUCT_CATEGORY_ORDER.map((category) => [category, [] as ShopProduct[]]),
  ) as Record<ProductCategory, ShopProduct[]>;

  for (const product of STATIC_SHOP_PRODUCTS) {
    if (filters.console && product.console !== filters.console) continue;
    if (filters.inStockOnly && !product.inStock) continue;
    if (
      product.category === "console" &&
      filters.condition &&
      product.condition !== filters.condition
    ) {
      continue;
    }
    grouped[product.category].push(product);
  }

  return grouped;
}

export function getProductById(productId: string): ShopProduct | undefined {
  return STATIC_SHOP_PRODUCTS.find((product) => product.id === productId);
}

export function getProductBySlug(
  consoleSlug: ShopConsole,
  slug: string,
): ShopProduct | undefined {
  return STATIC_SHOP_PRODUCTS.find(
    (product) => product.console === consoleSlug && product.slug === slug,
  );
}

export function getRelatedProducts(
  product: ShopProduct,
  limit = 3,
): ShopProduct[] {
  const sameCategory = STATIC_SHOP_PRODUCTS.filter(
    (entry) =>
      entry.console === product.console &&
      entry.category === product.category &&
      entry.id !== product.id,
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const sameConsole = STATIC_SHOP_PRODUCTS.filter(
    (entry) =>
      entry.console === product.console &&
      entry.id !== product.id &&
      !sameCategory.some((item) => item.id === entry.id),
  );

  return [...sameCategory, ...sameConsole].slice(0, limit);
}

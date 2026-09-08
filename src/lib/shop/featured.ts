import { PRODUCT_CATEGORY_ORDER } from "./categories";
import { SHOP_CONSOLE_ORDER } from "./meta";
import { getProducts } from "./products";
import type { ShopProduct } from "./types";

export function getFeaturedProducts(limit = 6): ShopProduct[] {
  const featured: ShopProduct[] = [];
  const seen = new Set<string>();

  for (const consoleSlug of SHOP_CONSOLE_ORDER) {
    const product = getProducts({
      console: consoleSlug,
      category: "console",
      inStockOnly: true,
    })[0];

    if (product) {
      featured.push(product);
      seen.add(product.id);
    }
  }

  for (const product of getProducts({ inStockOnly: true })) {
    if (featured.length >= limit) break;
    if (!seen.has(product.id)) {
      featured.push(product);
      seen.add(product.id);
    }
  }

  return featured.slice(0, limit);
}

export function getShopOverviewStats() {
  const products = getProducts();

  return {
    totalProducts: products.length,
    inStockCount: products.filter((product) => product.inStock).length,
    consoleShops: SHOP_CONSOLE_ORDER.length,
    categories: PRODUCT_CATEGORY_ORDER.map((category) => ({
      category,
      count: products.filter((product) => product.category === category).length,
    })),
  };
}

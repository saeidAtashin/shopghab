import { PRODUCT_DETAIL_OVERRIDES } from "./product-detail-overrides";
import {
  buildProductDetailFromTemplate,
  countProductDetailWords,
} from "./product-detail-templates";
import { getProductById } from "./products";
import type { ShopProduct, ShopProductDetail } from "./types";

function mergeDetail(
  base: ShopProductDetail,
  override: Partial<ShopProductDetail>,
): ShopProductDetail {
  return {
    summary: override.summary ?? base.summary,
    overview: override.overview ?? base.overview,
    features: override.features ?? base.features,
    specifications: override.specifications ?? base.specifications,
    whatsInBox: override.whatsInBox ?? base.whatsInBox,
    warranty: override.warranty ?? base.warranty,
    delivery: override.delivery ?? base.delivery,
    faqs: override.faqs ?? base.faqs,
    compatibility: override.compatibility ?? base.compatibility,
  };
}

export function buildProductDetail(product: ShopProduct): ShopProductDetail {
  const base = buildProductDetailFromTemplate(product);
  const override = PRODUCT_DETAIL_OVERRIDES[product.id];
  if (!override) return base;
  return mergeDetail(base, override);
}

export function getProductDetail(productId: string): ShopProductDetail | undefined {
  const product = getProductById(productId);
  if (!product) return undefined;
  return buildProductDetail(product);
}

export function getProductDetailWordCount(product: ShopProduct): number {
  return countProductDetailWords(buildProductDetail(product));
}

export { countProductDetailWords } from "./product-detail-templates";

import { normalizeSearchQuery, tokenizeSearchQuery } from "@/lib/search/normalize";
import { PRODUCT_CATEGORY_LABELS } from "./categories";
import { STATIC_SHOP_PRODUCTS } from "./products.static";
import {
  CATEGORY_SEARCH_ALIASES,
  CONSOLE_SEARCH_ALIASES,
  POPULAR_SEARCH_QUERIES,
} from "./search-aliases";
import { SHOP_CONSOLE_META } from "./meta";
import type { ShopProduct } from "./types";

export type ShopSearchResult = {
  product: ShopProduct;
  score: number;
  matchedText: string;
};

export { normalizeSearchQuery };

function tokenize(value: string): string[] {
  return tokenizeSearchQuery(value);
}

export function getProductSearchCorpus(product: ShopProduct): string[] {
  const consoleMeta = SHOP_CONSOLE_META[product.console];
  const categoryLabel = PRODUCT_CATEGORY_LABELS[product.category];

  return [
    product.title,
    product.slug,
    product.storage ?? "",
    product.edition ?? "",
    consoleMeta.label,
    consoleMeta.subtitle,
    consoleMeta.slug,
    categoryLabel,
    ...(product.badges ?? []),
    ...(product.highlights ?? []),
    ...(product.searchTerms ?? []),
    ...CONSOLE_SEARCH_ALIASES[product.console],
    ...CATEGORY_SEARCH_ALIASES[product.category],
  ]
    .map(normalizeSearchQuery)
    .filter(Boolean);
}

function scoreProduct(product: ShopProduct, query: string): ShopSearchResult | null {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return null;

  const title = normalizeSearchQuery(product.title);
  const slug = normalizeSearchQuery(product.slug);
  const edition = normalizeSearchQuery(product.edition ?? "");
  const storage = normalizeSearchQuery(product.storage ?? "");
  const corpus = getProductSearchCorpus(product);
  const corpusText = corpus.join(" ");

  let score = 0;
  let matchedText = product.title;

  if (title === normalizedQuery) score = 1000;
  else if (title.startsWith(normalizedQuery)) score = 900;
  else if (title.includes(normalizedQuery)) score = 800;
  else if (slug.includes(normalizedQuery)) {
    score = 700;
    matchedText = product.slug;
  } else if (edition.includes(normalizedQuery) || storage.includes(normalizedQuery)) {
    score = 650;
    matchedText = [product.edition, product.storage].filter(Boolean).join(" ");
  } else if (corpus.some((entry) => entry.includes(normalizedQuery))) {
    score = 600;
    matchedText =
      corpus.find((entry) => entry.includes(normalizedQuery)) ?? product.title;
  } else {
    const tokens = tokenize(normalizedQuery);
    const allTokensMatch = tokens.every((token) =>
      corpusText.includes(token),
    );
    if (!allTokensMatch) return null;
    score = 400 + tokens.length * 10;
    matchedText = tokens.join(" ");
  }

  if (product.inStock) score += 5;

  return { product, score, matchedText };
}

export function searchShopProducts(
  query: string,
  options: { limit?: number } = {},
): ShopSearchResult[] {
  const limit = options.limit ?? 8;
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return POPULAR_SEARCH_QUERIES.flatMap((popularQuery) =>
      searchShopProducts(popularQuery, { limit: 1 }),
    )
      .filter(
        (result, index, results) =>
          results.findIndex((entry) => entry.product.id === result.product.id) ===
          index,
      )
      .slice(0, limit);
  }

  return STATIC_SHOP_PRODUCTS.map((product) => scoreProduct(product, normalizedQuery))
    .filter((result): result is ShopSearchResult => result !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.product.inStock !== b.product.inStock) {
        return a.product.inStock ? -1 : 1;
      }
      return a.product.title.localeCompare(b.product.title, "fa");
    })
    .slice(0, limit);
}

export function getSearchResultProducts(
  query: string,
  options: { limit?: number } = {},
): ShopProduct[] {
  return searchShopProducts(query, options).map((result) => result.product);
}

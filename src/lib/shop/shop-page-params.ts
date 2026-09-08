import { normalizeSearchQuery } from "./search";
import type { ShopConsole } from "./types";

export type ConditionFilterKey = "all" | "new" | "used";

export function parseConditionParam(value?: string): ConditionFilterKey {
  if (value === "new" || value === "used") return value;
  return "all";
}

export function parseShopPageParams(searchParams: {
  q?: string;
  condition?: string;
}) {
  const searchQuery = normalizeSearchQuery(searchParams.q ?? "");
  const isSearchMode = searchQuery.length >= 2;
  const condition = parseConditionParam(searchParams.condition);

  return { searchQuery, isSearchMode, condition };
}

export function shopTabHref(
  consoleSlug: ShopConsole | "all",
  condition: ConditionFilterKey,
): string {
  const base = consoleSlug === "all" ? "/shop" : `/shop/${consoleSlug}`;
  if (condition === "all") return base;
  return `${base}?condition=${condition}`;
}

export function shopQueryString(params: {
  q?: string;
  condition?: ConditionFilterKey;
}): string {
  const search = new URLSearchParams();
  const normalizedQuery = params.q ? normalizeSearchQuery(params.q) : "";
  if (normalizedQuery) search.set("q", normalizedQuery);
  if (params.condition && params.condition !== "all") {
    search.set("condition", params.condition);
  }
  return search.toString();
}

export function buildShopPageUrl(
  basePath: string,
  params: { q?: string; condition?: ConditionFilterKey },
): string {
  const query = shopQueryString(params);
  return query ? `${basePath}?${query}` : basePath;
}

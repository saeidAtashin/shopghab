export type BrowseSort = "featured" | "newest" | "title";

export type BrowseQueryState = {
  q: string;
  sort: BrowseSort;
  page: number;
  attrs: string[];
  subs: string[];
  viewAll: boolean;
};

export type BrowseCategoryLink = {
  slug: string;
  name: string;
  href: string;
  count: number;
};

export type BrowseCategoryNode = BrowseCategoryLink & {
  children: BrowseCategoryLink[];
};

export type BrowseFilterGroup = {
  id: string;
  label: string;
  slug: string;
  options: { id: string; label: string }[];
};

export type BrowseShell = {
  categories: BrowseCategoryNode[];
  groups: BrowseFilterGroup[];
};

export function browseHref(pathname: string, query: Partial<BrowseQueryState> = {}): string {
  const params = new URLSearchParams();
  const q = query.q?.trim() ?? "";
  if (q) params.set("q", q);
  if (query.subs && query.subs.length > 0) params.set("sub", query.subs.join(","));
  if (query.attrs && query.attrs.length > 0) params.set("attr", query.attrs.join(","));
  if (query.viewAll) params.set("view", "all");
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function browseQueryFromParams(params: { get(name: string): string | null }): BrowseQueryState {
  const sortParam = params.get("sort");
  const sort: BrowseSort = sortParam === "newest" || sortParam === "title" ? sortParam : "featured";
  const parsedPage = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    q: (params.get("q") ?? "").trim(),
    sort,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    attrs: splitTokens(params.get("attr")),
    subs: splitTokens(params.get("sub")),
    viewAll: params.get("view") === "all",
  };
}

export function toggleBrowseToken(values: string[], id: string): string[] {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

function splitTokens(value: string | null): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const part of value.split(",")) {
    const token = part.trim();
    if (!token || seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }
  return tokens;
}

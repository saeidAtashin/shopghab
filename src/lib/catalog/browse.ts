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

export type BrowseFilterOption = {
  id: string;
  label: string;
  slug: string;
};

export type FilterLink = {
  id: string;
  groupSlug: string;
  slug: string;
};

export type BrowseFilterGroup = {
  id: string;
  label: string;
  slug: string;
  options: BrowseFilterOption[];
};

export type BrowseShell = {
  categories: BrowseCategoryNode[];
  groups: BrowseFilterGroup[];
};

export function filterLinksFromGroups(groups: BrowseFilterGroup[]): FilterLink[] {
  return groups.flatMap((group) =>
    group.options.map((option) => ({
      id: option.id,
      groupSlug: group.slug,
      slug: option.slug,
    })),
  );
}

function attributeFilterPath(link: FilterLink): string {
  return `/designs/filter/${link.groupSlug}/${link.slug}`;
}

export function browseHref(
  pathname: string,
  query: Partial<BrowseQueryState> = {},
  filters: FilterLink[] = [],
): string {
  const q = query.q?.trim() ?? "";
  const subs = query.subs ?? [];
  const attrs = query.attrs ?? [];
  const sort = query.sort;
  const page = query.page && query.page > 1 ? query.page : 1;
  const viewAll = query.viewAll === true;
  const defaultSort = !sort || sort === "featured";
  const single = attrs.length === 1 ? filters.find((item) => item.id === attrs[0]) : undefined;
  const bare = q.length === 0 && defaultSort && page === 1 && !viewAll;

  if (bare && subs.length === 1 && attrs.length === 0) {
    return `/designs/category/${subs[0]}`;
  }
  if (bare && single && subs.length === 0) {
    return attributeFilterPath(single);
  }

  let base = pathname;
  let queryAttrs = attrs;
  if (single && subs.length === 0 && !viewAll) {
    base = attributeFilterPath(single);
    queryAttrs = [];
  } else if (pathname.startsWith("/designs/filter/") && (attrs.length > 0 || subs.length > 0)) {
    base = "/designs";
  }

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (subs.length > 0) params.set("sub", subs.join(","));
  if (queryAttrs.length > 0) params.set("attr", queryAttrs.join(","));
  if (viewAll) params.set("view", "all");
  if (!defaultSort && sort) params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${base}?${search}` : base;
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

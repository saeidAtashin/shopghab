import Link from "next/link";

import type { CatalogSort, PublicFilterGroup } from "@/lib/catalog/logic";

type Props = {
  basePath: string;
  groups: PublicFilterGroup[];
  selectedSubs: string[];
  selectedAttrs: string[];
  q: string;
  sort: CatalogSort;
  viewAll?: boolean;
};

function toggle(values: string[], id: string): string[] {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

function filterHref(
  basePath: string,
  q: string,
  sort: CatalogSort,
  viewAll: boolean,
  subs: string[],
  attrs: string[],
): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (subs.length > 0) params.set("sub", subs.join(","));
  if (attrs.length > 0) params.set("attr", attrs.join(","));
  if (viewAll) params.set("view", "all");
  if (sort !== "featured") params.set("sort", sort);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function CatalogFilters({
  basePath,
  groups,
  selectedSubs,
  selectedAttrs,
  q,
  sort,
  viewAll = false,
}: Props) {
  const visible = groups.filter((group) => group.options.length > 0);
  if (visible.length === 0) return null;
  const filtered = selectedSubs.length > 0 || selectedAttrs.length > 0;

  return (
    <div className="space-y-4">
      {filtered ? (
        <Link
          href={filterHref(basePath, q, sort, viewAll, [], [])}
          className="text-sm font-semibold text-cyan-300 hover:underline"
        >
          پاک کردن فیلترها
        </Link>
      ) : null}
      {visible.map((group) => (
        <section key={group.id} aria-label={group.label} className="space-y-2">
          <h2 className="text-xs font-bold text-muted">{group.label}</h2>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selected =
                group.param === "sub" ? selectedSubs.includes(option.id) : selectedAttrs.includes(option.id);
              const subs = group.param === "sub" ? toggle(selectedSubs, option.id) : selectedSubs;
              const attrs = group.param === "attr" ? toggle(selectedAttrs, option.id) : selectedAttrs;
              return (
                <Link
                  key={option.id}
                  href={filterHref(basePath, q, sort, viewAll, subs, attrs)}
                  aria-current={selected ? "true" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    selected
                      ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                      : "border-border text-muted hover:border-cyan-500/30 hover:text-foreground"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

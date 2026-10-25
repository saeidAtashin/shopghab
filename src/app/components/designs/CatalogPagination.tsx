"use client";

import { useRouter } from "next/navigation";

import BrowseLink from "@/app/components/designs/BrowseLink";
import { browseHref, type BrowseSort } from "@/lib/catalog/browse";

type Props = {
  pathname: string;
  q: string;
  sort: BrowseSort;
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  attr?: string;
  sub?: string;
  viewAll?: boolean;
};

function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const wanted = new Set<number>([1, pageCount, page - 2, page - 1, page, page + 1, page + 2]);
  const pages = [...wanted].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);
  const window: (number | "gap")[] = [];
  let previous = 0;
  for (const value of pages) {
    if (previous && value - previous > 1) window.push("gap");
    window.push(value);
    previous = value;
  }
  return window;
}

export default function CatalogPagination({
  pathname,
  q,
  sort,
  page,
  pageSize,
  pageCount,
  total,
  attr = "",
  sub = "",
  viewAll = false,
}: Props) {
  const router = useRouter();
  if (total <= 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const attrs = attr ? attr.split(",").filter(Boolean) : [];
  const subs = sub ? sub.split(",").filter(Boolean) : [];
  const hrefFor = (nextPage: number) =>
    browseHref(pathname, { q, sort, attrs, subs, viewAll, page: nextPage });

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted">
        نمایش {from.toLocaleString("fa-IR")}–{to.toLocaleString("fa-IR")} از {total.toLocaleString("fa-IR")} طرح
      </p>
      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          {page > 1 ? (
            <BrowseLink
              href={hrefFor(page - 1)}
              rel="prev"
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold"
            >
              قبلی
            </BrowseLink>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm opacity-40">
              قبلی
            </span>
          )}
          {pageWindow(page, pageCount).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1 text-sm text-muted" aria-hidden>
                …
              </span>
            ) : (
              <BrowseLink
                key={item}
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-2 text-sm font-semibold ${
                  item === page
                    ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                    : "border-border text-foreground"
                }`}
              >
                {item.toLocaleString("fa-IR")}
              </BrowseLink>
            ),
          )}
          {page < pageCount ? (
            <BrowseLink
              href={hrefFor(page + 1)}
              rel="next"
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold"
            >
              بعدی
            </BrowseLink>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm opacity-40">
              بعدی
            </span>
          )}
          <label className="inline-flex min-h-11 items-center gap-2 text-sm text-muted">
            <span>صفحه</span>
            <select
              aria-label="انتخاب شماره صفحه"
              value={page}
              onChange={(event) => {
                const nextPage = Number.parseInt(event.target.value, 10);
                if (!Number.isFinite(nextPage) || nextPage === page) return;
                router.push(hrefFor(nextPage), { scroll: false });
              }}
              className="min-h-11 rounded-lg border border-border bg-input-bg px-2 text-foreground outline-none focus:border-cyan-500"
            >
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value.toLocaleString("fa-IR")}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </nav>
  );
}

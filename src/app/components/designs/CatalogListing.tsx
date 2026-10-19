import Link from "next/link";

import CatalogDesignCard from "@/app/components/designs/CatalogDesignCard";
import type { CatalogSort } from "@/lib/catalog/logic";
import type { PublicDesign } from "@/lib/catalog/schema";

type Props = {
  designs: PublicDesign[];
  categoryNames: Record<string, string>;
  basePath: string;
  q: string;
  sort: CatalogSort;
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  attr?: string;
  attrLabel?: string;
  showResults?: boolean;
  viewAll?: boolean;
  heading?: string;
};

function listingHref(
  basePath: string,
  page: number,
  q: string,
  sort: CatalogSort,
  attr: string,
  viewAll: boolean,
): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (attr) params.set("attr", attr);
  if (viewAll) params.set("view", "all");
  if (sort !== "featured") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function CatalogListing({
  designs,
  categoryNames,
  basePath,
  q,
  sort,
  page,
  pageSize,
  pageCount,
  total,
  attr = "",
  attrLabel = "",
  showResults = true,
  viewAll = false,
  heading,
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      {attr ? (
        <p className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>ویژگی: {attrLabel || "انتخاب‌شده"}</span>
          <Link
            href={listingHref(basePath, 1, q, sort, "", viewAll)}
            className="font-semibold text-cyan-300 hover:underline"
          >
            حذف ویژگی
          </Link>
        </p>
      ) : null}

      <form action={basePath} method="get" className="flex flex-col gap-3 sm:flex-row">
        {attr ? <input type="hidden" name="attr" value={attr} /> : null}
        {viewAll ? <input type="hidden" name="view" value="all" /> : null}
        <label className="flex-1 text-sm">
          <span className="mb-1 block text-muted">جستجو</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="نام طرح"
            className="w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500"
          />
        </label>
        <label className="text-sm sm:w-52">
          <span className="mb-1 block text-muted">مرتب‌سازی</span>
          <select
            name="sort"
            defaultValue={sort}
            className="w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500"
          >
            <option value="featured">پیشنهادی</option>
            <option value="newest">جدیدترین</option>
            <option value="title">عنوان</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black sm:self-end"
        >
          اعمال
        </button>
      </form>

      {showResults && heading ? <h2 className="text-lg font-black text-foreground">{heading}</h2> : null}

      {showResults && designs.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-muted">
          طرحی با این شرایط پیدا نشد.
        </p>
      ) : null}

      {showResults && designs.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {designs.map((design, index) => (
            <CatalogDesignCard
              key={design.id}
              design={design}
              priority={index === 0}
              categoryName={
                categoryNames[design.categoryIds.find((id) => categoryNames[id]) ?? ""]
              }
            />
          ))}
        </div>
      ) : null}

      {showResults && pageCount > 1 ? (
        <nav
          aria-label="صفحه‌بندی"
          className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"
        >
          <p className="text-sm text-muted">
            نمایش {from.toLocaleString("fa-IR")}–{to.toLocaleString("fa-IR")} از{" "}
            {total.toLocaleString("fa-IR")} طرح
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={listingHref(basePath, page - 1, q, sort, attr, viewAll)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold"
                rel="prev"
              >
                قبلی
              </Link>
            ) : (
              <span className="rounded-lg border border-border px-3 py-2 text-sm opacity-40">قبلی</span>
            )}
            <span className="min-w-16 text-center text-sm text-muted">
              {page.toLocaleString("fa-IR")} / {pageCount.toLocaleString("fa-IR")}
            </span>
            {page < pageCount ? (
              <Link
                href={listingHref(basePath, page + 1, q, sort, attr, viewAll)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold"
                rel="next"
              >
                بعدی
              </Link>
            ) : (
              <span className="rounded-lg border border-border px-3 py-2 text-sm opacity-40">بعدی</span>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

import Link from "next/link";

import CatalogDesignCard from "@/app/components/designs/CatalogDesignCard";
import type { CatalogSort } from "@/lib/catalog/logic";
import type { PublicDesign } from "@/lib/catalog/schema";

type CategoryLink = {
  slug: string;
  name: string;
};

type Props = {
  designs: PublicDesign[];
  categoryNames: Record<string, string>;
  categories: CategoryLink[];
  currentCategorySlug?: string;
  subcategories?: CategoryLink[];
  basePath: string;
  q: string;
  sort: CatalogSort;
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  attr?: string;
  attrLabel?: string;
};

function listingHref(basePath: string, page: number, q: string, sort: CatalogSort, attr: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (attr) params.set("attr", attr);
  if (sort !== "featured") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function CatalogListing({
  designs,
  categoryNames,
  categories,
  currentCategorySlug,
  subcategories = [],
  basePath,
  q,
  sort,
  page,
  pageSize,
  pageCount,
  total,
  attr = "",
  attrLabel = "",
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <nav aria-label="دسته‌ها" className="flex flex-wrap gap-2">
        <Link
          href="/designs"
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            currentCategorySlug
              ? "border-border text-muted hover:border-cyan-500/30"
              : "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
          }`}
          aria-current={currentCategorySlug ? undefined : "page"}
        >
          همه
        </Link>
        {categories.map((category) => {
          const active = category.slug === currentCategorySlug;
          return (
            <Link
              key={category.slug}
              href={`/designs/category/${category.slug}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                active
                  ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                  : "border-border text-muted hover:border-cyan-500/30 hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {category.name}
            </Link>
          );
        })}
      </nav>

      {subcategories.length > 0 ? (
        <nav aria-label="زیردسته‌ها" className="flex flex-wrap gap-2">
          {subcategories.map((category) => (
            <Link
              key={category.slug}
              href={`/designs/category/${category.slug}`}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {attr ? (
        <p className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>ویژگی: {attrLabel || "انتخاب‌شده"}</span>
          <Link href={listingHref(basePath, 1, q, sort, "")} className="font-semibold text-cyan-300 hover:underline">
            حذف ویژگی
          </Link>
        </p>
      ) : null}

      <form action={basePath} method="get" className="flex flex-col gap-3 sm:flex-row">
        {attr ? <input type="hidden" name="attr" value={attr} /> : null}
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
        <label className="sm:w-52 text-sm">
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

      {designs.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-muted">
          طرحی با این شرایط پیدا نشد.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {designs.map((design, index) => (
            <CatalogDesignCard
              key={design.id}
              design={design}
              priority={index === 0}
              categoryName={
                categoryNames[
                  design.categoryIds.find((id) => categoryNames[id]) ?? ""
                ]
              }
            />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <nav aria-label="صفحه‌بندی" className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted">
            نمایش {from}–{to} از {total} طرح
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={listingHref(basePath, page - 1, q, sort, attr)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold"
                rel="prev"
              >
                قبلی
              </Link>
            ) : (
              <span className="rounded-lg border border-border px-3 py-2 text-sm opacity-40">قبلی</span>
            )}
            <span className="min-w-16 text-center text-sm text-muted">
              {page} / {pageCount}
            </span>
            {page < pageCount ? (
              <Link
                href={listingHref(basePath, page + 1, q, sort, attr)}
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

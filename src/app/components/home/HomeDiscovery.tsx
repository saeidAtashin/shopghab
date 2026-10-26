"use client";

import { ChevronDown, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";

import BrowseLink from "@/app/components/designs/BrowseLink";
import CatalogDesignCard from "@/app/components/designs/CatalogDesignCard";
import CatalogPagination from "@/app/components/designs/CatalogPagination";
import { colorSwatch } from "@/app/components/designs/browse-visuals";
import {
  browseHref,
  toggleBrowseToken,
  type BrowseFilterGroup,
  type BrowseShell,
  type BrowseSort,
} from "@/lib/catalog/browse";
import type { PublicDesign } from "@/lib/catalog/schema";
import { designedAssetUrl } from "@/lib/designed-assets";
import { lockPageScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

export type HomePhoneOption = {
  name: string;
  href: string;
};

export type HomeRail = {
  title: string;
  href: string;
  items: PublicDesign[];
};

export type HomeBrandLink = {
  name: string;
  href: string;
};

export type HomeFeaturedCollection = {
  title: string;
  href: string;
  image: string;
  description: string;
};

type QueryState = {
  q: string;
  sort: BrowseSort;
  attrs: string[];
  page: number;
};

type Props = {
  shell: BrowseShell;
  query: QueryState;
  designs: PublicDesign[];
  categoryNames: Record<string, string>;
  priceLabel: string;
  total: number;
  pageSize: number;
  pageCount: number;
  models: HomePhoneOption[];
  brands: HomeBrandLink[];
  featured: HomeFeaturedCollection | null;
  rail: HomeRail | null;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-border bg-input-bg px-3 text-sm text-foreground outline-none focus:border-[#5145FF]";

const toolbarField =
  "min-h-11 shrink-0 rounded-xl border border-border bg-input-bg px-3 text-sm text-foreground outline-none focus:border-[#5145FF]";

function listingHref(query: QueryState, patch: Partial<QueryState> = {}): string {
  return browseHref("/", {
    q: patch.q ?? query.q,
    sort: patch.sort ?? query.sort,
    attrs: patch.attrs ?? query.attrs,
    page: patch.page ?? 1,
  });
}

function categoryName(design: PublicDesign, names: Record<string, string>): string | undefined {
  for (const id of design.categoryIds) {
    const name = names[id];
    if (name) return name;
  }
  return undefined;
}

function optionLabel(shell: BrowseShell, id: string): string {
  for (const group of shell.groups) {
    const option = group.options.find((item) => item.id === id);
    if (option) return option.label;
  }
  return id;
}

function FilterGroups({
  shell,
  query,
  brands,
  opened,
  onToggle,
}: {
  shell: BrowseShell;
  query: QueryState;
  brands: HomeBrandLink[];
  opened: Record<string, boolean | undefined>;
  onToggle: (id: string, open: boolean) => void;
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border bg-card">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-black text-foreground"
          aria-expanded={categoriesOpen}
          onClick={() => setCategoriesOpen((value) => !value)}
        >
          دسته‌بندی‌ها
          <ChevronDown className={cn("h-4 w-4 transition", categoriesOpen && "rotate-180")} aria-hidden />
        </button>
        {categoriesOpen ? (
          <ul className="space-y-1 px-2 pb-3">
            <li>
              <Link
                href="/designs"
                className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-foreground"
              >
                <LayoutGrid className="h-4 w-4 text-[#C4C0FF]" aria-hidden />
                همه دسته‌بندی‌ها
              </Link>
            </li>
            {shell.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={category.href}
                  className="block rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-surface"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {shell.groups.map((group) => (
        <AttributeGroup
          key={group.id}
          group={group}
          query={query}
          open={opened[group.id] ?? group.slug === "colors"}
          onToggle={onToggle}
        />
      ))}

      {brands.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card px-4 py-3">
          <h2 className="mb-2 text-sm font-black text-foreground">مناسب برای</h2>
          <ul className="space-y-1">
            {brands.map((brand) => (
              <li key={brand.href}>
                <Link
                  href={brand.href}
                  className="flex items-center gap-2 rounded-xl px-1 py-1.5 text-sm text-foreground transition hover:bg-surface"
                >
                  <span className="h-4 w-4 rounded border border-white/25" aria-hidden />
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function AttributeGroup({
  group,
  query,
  open,
  onToggle,
}: {
  group: BrowseFilterGroup;
  query: QueryState;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
}) {
  const isColors = group.slug === "colors";
  return (
    <section className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-black text-foreground"
        aria-expanded={open}
        onClick={() => onToggle(group.id, !open)}
      >
        {isColors ? "فیلتر رنگ" : group.label}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <ul className={cn("px-3 pb-3", isColors ? "flex flex-wrap gap-2" : "space-y-1")}>
          {group.options.map((option) => {
            const active = query.attrs.includes(option.id);
            const href = listingHref(query, { attrs: toggleBrowseToken(query.attrs, option.id) });
            const swatch = isColors ? colorSwatch(option.label) : null;
            if (isColors) {
              return (
                <li key={option.id}>
                  <BrowseLink
                    href={href}
                    aria-label={option.label}
                    title={option.label}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full border",
                      active ? "border-[#5145FF] ring-2 ring-[#5145FF]/40" : "border-white/15",
                    )}
                  >
                    {typeof swatch === "string" ? (
                      <span className="h-5 w-5 rounded-full" style={{ backgroundColor: swatch }} />
                    ) : (
                      <span className="text-[10px] text-muted">{option.label.slice(0, 1)}</span>
                    )}
                  </BrowseLink>
                </li>
              );
            }
            return (
              <li key={option.id}>
                <BrowseLink
                  href={href}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-[#5145FF]/15 text-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  {option.label}
                </BrowseLink>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

export default function HomeDiscovery({
  shell,
  query,
  designs,
  categoryNames,
  priceLabel,
  total,
  pageSize,
  pageCount,
  models,
  brands,
  featured,
  rail,
}: Props) {
  const router = useRouter();
  const searchId = useId();
  const sortId = useId();
  const modelId = useId();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean | undefined>>({});
  const colorGroup = shell.groups.find((group) => group.slug === "colors");

  useEffect(() => {
    if (!drawerOpen) return;
    const unlock = lockPageScroll();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const q = String(data.get("q") ?? "").trim();
    router.push(listingHref(query, { q }), { scroll: false });
  }

  function changeSort(sort: BrowseSort) {
    router.push(listingHref(query, { sort }), { scroll: false });
  }

  function renderFilters() {
    return (
      <FilterGroups
        shell={shell}
        query={query}
        brands={brands}
        opened={opened}
        onToggle={(id, open) => setOpened((current) => ({ ...current, [id]: open }))}
      />
    );
  }

  return (
    <section aria-label="طرح‌ها" className="hidden space-y-4 xl:block">
      <div className="sticky top-[4.5rem] z-30 -mx-4 border-b border-border bg-[#080D18]/95 px-4 py-3 backdrop-blur-md xl:hidden">
        <div className="flex items-center gap-2">
          <form role="search" onSubmit={submitSearch} className="relative min-w-0 flex-1">
            <label htmlFor={`${searchId}-mobile`} className="sr-only">
              جستجوی طرح
            </label>
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id={`${searchId}-mobile`}
              type="search"
              name="q"
              key={`${searchId}-${query.q}`}
              defaultValue={query.q}
              placeholder="جستجوی طرح"
              className={`${fieldClass} ps-10`}
            />
          </form>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="home-filters"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border px-3 text-sm font-bold"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            فیلتر
            {query.attrs.length > 0 ? (
              <span className="rounded-full bg-[#5145FF]/20 px-1.5 text-xs text-[#C4C0FF]">
                {query.attrs.length.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "xl:grid xl:items-start xl:gap-4",
          rail || featured
            ? "xl:grid-cols-[16rem_minmax(0,1fr)_17rem]"
            : "xl:grid-cols-[16rem_minmax(0,1fr)]",
        )}
      >
        <div className="min-w-0 xl:order-2">
          <div className="mb-4 rounded-2xl border border-border bg-card p-2">
            <div className="flex flex-wrap items-center gap-2">
              {colorGroup && colorGroup.options.length > 0 ? (
                <div className="flex items-center gap-2 pe-1">
                  <span className="text-xs font-bold text-muted">رنگ قاب/بدنه</span>
                  <ul className="flex gap-1.5" aria-label={colorGroup.label}>
                    {colorGroup.options.map((option) => {
                      const active = query.attrs.includes(option.id);
                      const swatch = colorSwatch(option.label);
                      return (
                        <li key={option.id} className="shrink-0">
                          <BrowseLink
                            href={listingHref(query, { attrs: toggleBrowseToken(query.attrs, option.id) })}
                            aria-label={option.label}
                            aria-current={active ? "true" : undefined}
                            title={option.label}
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-full border",
                              active ? "border-[#5145FF] ring-2 ring-[#5145FF]/50" : "border-white/15",
                            )}
                          >
                            {typeof swatch === "string" ? (
                              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: swatch }} />
                            ) : (
                              <span className="text-[10px] text-muted">{option.label.slice(0, 1)}</span>
                            )}
                          </BrowseLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
              <label className="sr-only" htmlFor={sortId}>
                مرتب‌سازی
              </label>
              <select
                id={sortId}
                value={query.sort}
                onChange={(event) => changeSort(event.target.value as BrowseSort)}
                className={`${fieldClass} w-auto min-w-[8.5rem]`}
              >
                <option value="featured">مرتب‌سازی</option>
                <option value="newest">جدیدترین</option>
                <option value="title">عنوان</option>
              </select>
              <form role="search" onSubmit={submitSearch} className="min-w-[10rem] flex-1">
                <label htmlFor={searchId} className="sr-only">
                  جستجوی طرح
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                  <input
                    id={searchId}
                    type="search"
                    name="q"
                    key={query.q}
                    defaultValue={query.q}
                    placeholder="جستجوی طرح..."
                    className={`${fieldClass} ps-10`}
                  />
                </div>
              </form>
              <label className="sr-only" htmlFor={modelId}>
                انتخاب مدل گوشی
              </label>
              <select
                id={modelId}
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) router.push(event.target.value);
                }}
                className={`${fieldClass} w-auto min-w-[10rem]`}
              >
                <option value="">انتخاب مدل گوشی</option>
                {models.map((model) => (
                  <option key={model.href} value={model.href}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            {query.q || query.attrs.length > 0 || query.sort !== "featured" ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border px-1 pt-2">
                <p className="text-xs text-muted">{total.toLocaleString("fa-IR")} طرح</p>
                {query.q ? (
                  <BrowseLink
                    href={listingHref(query, { q: "" })}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs"
                  >
                    {query.q}
                    <X className="h-3 w-3" aria-hidden />
                    <span className="sr-only">حذف جستجو</span>
                  </BrowseLink>
                ) : null}
                {query.attrs.map((id) => (
                  <BrowseLink
                    key={id}
                    href={listingHref(query, { attrs: query.attrs.filter((value) => value !== id) })}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs"
                  >
                    {optionLabel(shell, id)}
                    <X className="h-3 w-3" aria-hidden />
                    <span className="sr-only">حذف فیلتر</span>
                  </BrowseLink>
                ))}
                <BrowseLink href="/" className="text-xs font-bold text-[#C4C0FF] hover:underline">
                  پاک کردن همه
                </BrowseLink>
              </div>
            ) : null}
          </div>

          {designs.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted">
              طرحی با این فیلتر پیدا نشد.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {designs.map((design, index) => (
                <CatalogDesignCard
                  key={design.id}
                  design={design}
                  variant="storefront"
                  priceLabel={priceLabel}
                  categoryName={categoryName(design, categoryNames)}
                  priority={index < 4}
                />
              ))}
            </div>
          )}

          <div className="mt-4">
            <CatalogPagination
              pathname="/"
              q={query.q}
              sort={query.sort}
              page={query.page}
              pageSize={pageSize}
              pageCount={pageCount}
              total={total}
              attr={query.attrs.join(",")}
            />
          </div>
        </div>

        {rail || featured ? (
          <aside className="mt-6 space-y-4 xl:order-3 xl:mt-0">
            {featured ? (
              <article className="overflow-hidden rounded-2xl border border-border bg-card">
                <Link href={featured.href} className="relative block aspect-[4/3] bg-surface">
                  {featured.image ? (
                    <Image
                      src={designedAssetUrl(featured.image)}
                      alt=""
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
                <div className="space-y-2 p-3">
                  <h2 className="text-sm font-black text-foreground">کالکشن‌های منتخب</h2>
                  <p className="line-clamp-2 text-xs leading-5 text-muted">
                    {featured.description || featured.title}
                  </p>
                  <Link
                    href={featured.href}
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-gradient-to-l from-[#5145FF] to-[#6A5CFF] px-4 text-xs font-bold text-white"
                  >
                    مشاهده کالکشن
                  </Link>
                </div>
              </article>
            ) : null}
            {rail ? (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-base font-black text-foreground">پرفروش‌ترین‌ها</h2>
                  <Link href={rail.href} className="text-xs font-bold text-[#C4C0FF] hover:underline">
                    مشاهده همه
                  </Link>
                </div>
                <ul className="space-y-2">
                  {rail.items.map((design) => {
                    const image = design.thumbnailPath || design.imagePath;
                    return (
                      <li key={design.id}>
                        <Link
                          href={`/designs/${design.slug}`}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2 transition hover:border-[#5145FF]/45"
                        >
                          <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                            {image ? (
                              <Image
                                src={designedAssetUrl(image)}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-contain p-1"
                              />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-2 block text-sm font-bold text-foreground">{design.title}</span>
                            {priceLabel ? <span className="mt-1 block text-xs text-muted">{priceLabel}</span> : null}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </aside>
        ) : null}

        <aside className="hidden xl:order-1 xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pe-1">{renderFilters()}</div>
        </aside>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[60] xl:hidden",
          drawerOpen ? "visible" : "invisible pointer-events-none",
        )}
        inert={drawerOpen ? undefined : true}
      >
        <button
          type="button"
          aria-label="بستن فیلترها"
          className="absolute inset-0 bg-[#080D18]/80"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          id="home-filters"
          role="dialog"
          aria-modal="true"
          aria-label="فیلترها"
          className={cn(
            "absolute end-0 top-0 flex h-full w-[min(100vw-3rem,22rem)] flex-col border-s border-border bg-background transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-black">فیلترها</h2>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="بستن" className="rounded-lg p-2">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">{renderFilters()}</div>
        </div>
      </div>
    </section>
  );
}

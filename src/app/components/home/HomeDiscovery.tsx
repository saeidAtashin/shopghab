"use client";

import { ChevronDown, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";

import BrowseLink from "@/app/components/designs/BrowseLink";
import CatalogDesignCard from "@/app/components/designs/CatalogDesignCard";
import StorefrontToolbar from "@/app/components/designs/StorefrontToolbar";
import HomeDesignFilmstrip, { type FilmDesign } from "@/app/components/home/HomeDesignFilmstrip";
import { colorSwatch, filterToneHex, swatchLoaderAccent } from "@/app/components/designs/browse-visuals";
import {
  browseHref,
  filterLinksFromGroups,
  toggleBrowseToken,
  type BrowseFilterGroup,
  type BrowseShell,
  type BrowseSort,
  type FilterLink,
} from "@/lib/catalog/browse";
import type { PublicDesign } from "@/lib/catalog/schema";
import { designedAssetUrl } from "@/lib/designed-assets";
import { lockPageScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

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
  pageCount: number;
  brands: HomeBrandLink[];
  featured: HomeFeaturedCollection | null;
  rail: HomeRail | null;
  film: FilmDesign[];
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-border bg-input-bg px-3 text-sm text-foreground outline-none focus:border-[#5145FF]";

function listingHref(
  query: QueryState,
  patch: Partial<QueryState> = {},
  filters: FilterLink[] = [],
): string {
  return browseHref(
    "/",
    {
      q: patch.q ?? query.q,
      sort: patch.sort ?? query.sort,
      attrs: patch.attrs ?? query.attrs,
      page: 1,
    },
    filters,
  );
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

const cardGridClass = "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4";

function gridColumns(cards: HTMLElement[]) {
  const first = cards[0];
  if (!first) return 1;
  const top = first.getBoundingClientRect().top;
  let count = 1;
  for (let index = 1; index < cards.length; index += 1) {
    const card = cards[index];
    if (!card || Math.abs(card.getBoundingClientRect().top - top) > 1) break;
    count += 1;
  }
  return count;
}

function DesignGrid({
  designs,
  film,
  filmAfter,
  priceLabel,
  categoryNames,
}: {
  designs: PublicDesign[];
  film: FilmDesign[];
  filmAfter: number | null;
  priceLabel: string;
  categoryNames: Record<string, string>;
}) {
  const cutoff = filmAfter ?? designs.length;
  const lead = designs.slice(0, cutoff);
  const rest = designs.slice(cutoff);
  const cards = (list: PublicDesign[], offset: number) =>
    list.map((design, index) => (
      <div key={design.id} data-design-card>
        <CatalogDesignCard
          design={design}
          variant="storefront"
          priceLabel={priceLabel}
          categoryName={categoryName(design, categoryNames)}
          priority={offset + index < 4}
        />
      </div>
    ));

  return (
    <>
      {lead.length > 0 ? <div className={cardGridClass}>{cards(lead, 0)}</div> : null}
      {film.length > 0 ? <HomeDesignFilmstrip designs={film} className="my-4" /> : null}
      {rest.length > 0 ? <div className={`${cardGridClass} mt-3`}>{cards(rest, lead.length)}</div> : null}
    </>
  );
}

function FilterGroups({
  shell,
  query,
  brands,
  opened,
  onToggle,
  filters,
}: {
  shell: BrowseShell;
  query: QueryState;
  brands: HomeBrandLink[];
  opened: Record<string, boolean | undefined>;
  onToggle: (id: string, open: boolean) => void;
  filters: FilterLink[];
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
              <BrowseLink
                href="/designs"
                showLoader
                className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-foreground"
              >
                <LayoutGrid className="h-4 w-4 text-[#C4C0FF]" aria-hidden />
                همه دسته‌بندی‌ها
              </BrowseLink>
            </li>
            {shell.categories.map((category) => (
              <li key={category.slug}>
                <BrowseLink
                  href={category.href}
                  showLoader
                  className="block rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-surface"
                >
                  {category.name}
                </BrowseLink>
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
          open={opened[group.id] ?? true}
          onToggle={onToggle}
          filters={filters}
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
  filters,
}: {
  group: BrowseFilterGroup;
  query: QueryState;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
  filters: FilterLink[];
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
            const href = listingHref(query, { attrs: toggleBrowseToken(query.attrs, option.id) }, filters);
            const swatch = isColors ? colorSwatch(option.label) : null;
            if (isColors) {
              return (
                <li key={option.id}>
                  <BrowseLink
                    href={href}
                    showLoader
                    loaderAccent={swatchLoaderAccent(option.label)}
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
                  showLoader
                  loaderAccent={filterToneHex(group.slug)}
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
  pageCount,
  brands,
  featured,
  rail,
  film,
}: Props) {
  const router = useRouter();
  const searchId = useId();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean | undefined>>({});
  const [searchValue, setSearchValue] = useState(query.q);
  const [items, setItems] = useState(designs);
  const [hasMore, setHasMore] = useState(pageCount > 1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filmAfter, setFilmAfter] = useState<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(pageCount > 1);
  const nextPageRef = useRef(2);
  const colorGroup = shell.groups.find((group) => group.slug === "colors");
  const filters = filterLinksFromGroups(shell.groups);
  const queryKey = `${query.q}|${query.sort}|${query.attrs.join(",")}`;

  useEffect(() => {
    setSearchValue(query.q);
    setItems(designs);
    nextPageRef.current = 2;
    const more = pageCount > 1;
    setHasMore(more);
    hasMoreRef.current = more;
    setFilmAfter(null);
  }, [queryKey, designs, pageCount, query.q]);

  useLayoutEffect(() => {
    const filters = filtersRef.current;
    const column = columnRef.current;
    if (!filters || !column || film.length === 0) return;

    const measure = () => {
      const cards = [...column.querySelectorAll<HTMLElement>("[data-design-card]")];
      if (cards.length === 0) return;
      const columns = gridColumns(cards);
      const sidebar = filters.getClientRects().length > 0;
      let next = cards.length;
      if (!sidebar) {
        next = Math.min(cards.length, columns * 2);
      } else {
        const film = column.querySelector<HTMLElement>("[data-filmstrip]");
        const filmHeight = film?.getBoundingClientRect().height ?? 0;
        const columnTop = column.getBoundingClientRect().top;
        const filterBottom = filters.getBoundingClientRect().bottom - columnTop;
        for (let index = 0; index < cards.length; index += 1) {
          const card = cards[index];
          if (!card) continue;
          const filmBefore = film
            ? (film.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
            : false;
          const bottom = card.getBoundingClientRect().bottom - columnTop - (filmBefore ? filmHeight : 0);
          if (bottom >= filterBottom) {
            next = Math.min(cards.length, Math.floor(index / columns) * columns + columns);
            break;
          }
        }
      }
      setFilmAfter((current) => (current === next ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(filters);
    observer.observe(column);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [film.length, items.length, queryKey]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      if (!hasMoreRef.current || loadingRef.current) return;
      const page = nextPageRef.current;
      loadingRef.current = true;
      setLoadingMore(true);
      const params = new URLSearchParams();
      if (query.q) params.set("q", query.q);
      if (query.sort !== "featured") params.set("sort", query.sort);
      if (query.attrs.length > 0) params.set("attr", query.attrs.join(","));
      params.set("page", String(page));
      fetch(`/api/catalog/designs?${params.toString()}`)
        .then((response) => response.json())
        .then((data: { items?: PublicDesign[]; pageCount?: number }) => {
          const incoming = data.items ?? [];
          setItems((current) => {
            const seen = new Set(current.map((design) => design.id));
            return [...current, ...incoming.filter((design) => !seen.has(design.id))];
          });
          const more = page < (data.pageCount ?? page);
          nextPageRef.current = page + 1;
          hasMoreRef.current = more;
          setHasMore(more);
        })
        .finally(() => {
          loadingRef.current = false;
          setLoadingMore(false);
        });
    }, { rootMargin: "600px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [queryKey, query.q, query.sort, query.attrs, hasMore, loadingMore]);

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
    const fromForm = data.get("q");
    const q = String(fromForm ?? searchValue).trim();
    router.push(listingHref(query, { q }, filters), { scroll: false });
  }

  function changeSort(sort: BrowseSort) {
    router.push(listingHref(query, { sort }, filters), { scroll: false });
  }

  function renderFilters() {
    return (
      <FilterGroups
        shell={shell}
        query={query}
        brands={brands}
        opened={opened}
        onToggle={(id, open) => setOpened((current) => ({ ...current, [id]: open }))}
        filters={filters}
      />
    );
  }

  return (
    <section aria-label="طرح‌ها" className="space-y-4">
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
        <div ref={columnRef} className="min-w-0 overflow-visible xl:order-2">
          <div className="mb-4">
            <StorefrontToolbar
              colors={(colorGroup?.options ?? []).map((option) => ({
                id: option.id,
                label: option.label,
                active: query.attrs.includes(option.id),
                href: listingHref(query, { attrs: toggleBrowseToken(query.attrs, option.id) }, filters),
              }))}
              sort={query.sort}
              onSort={changeSort}
              searchValue={searchValue}
              onSearchValue={setSearchValue}
              onSearch={submitSearch}
            />
            {query.q || query.attrs.length > 0 || query.sort !== "featured" ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted">{total.toLocaleString("fa-IR")} طرح</p>
                {query.q ? (
                  <BrowseLink
                    href={listingHref(query, { q: "" }, filters)}
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
                    href={listingHref(query, { attrs: query.attrs.filter((value) => value !== id) }, filters)}
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
            <DesignGrid
              designs={items}
              film={film}
              filmAfter={filmAfter}
              priceLabel={priceLabel}
              categoryNames={categoryNames}
            />
          )}

          <div ref={sentinel} className="mt-4 text-center text-sm text-muted">
            {loadingMore ? "در حال بارگذاری طرح‌های بیشتر..." : null}
            {!hasMore && items.length > 0 ? (
              <p>
                {items.length.toLocaleString("fa-IR")} از {total.toLocaleString("fa-IR")} طرح
              </p>
            ) : null}
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
                                className="origin-center scale-200 object-contain"
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

        <aside ref={filtersRef} className="hidden xl:order-1 xl:block">{renderFilters()}</aside>
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

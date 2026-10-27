"use client";

import { ChevronDown, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import BrowseLink from "@/app/components/designs/BrowseLink";
import StorefrontToolbar from "@/app/components/designs/StorefrontToolbar";
import {
  allDesignsVisual,
  categoryVisual,
  colorSwatch,
  filterToneHex,
  filterVisual,
  swatchLoaderAccent,
  type Accent,
} from "@/app/components/designs/browse-visuals";
import {
  browseHref,
  browseQueryFromParams,
  filterLinksFromGroups,
  toggleBrowseToken,
  type BrowseCategoryNode,
  type BrowseFilterGroup,
  type BrowseQueryState,
  type BrowseShell,
  type BrowseSort,
} from "@/lib/catalog/browse";
import { lockPageScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

type Props = {
  shell: BrowseShell;
  children: ReactNode;
};

export default function CatalogBrowseChrome({ shell, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = filterLinksFromGroups(shell.groups);
  const pathFilter = filters.find((item) => pathname === `/designs/filter/${item.groupSlug}/${item.slug}`);
  const queryFromUrl = browseQueryFromParams(params);
  const query = {
    ...queryFromUrl,
    attrs:
      pathFilter && !queryFromUrl.attrs.includes(pathFilter.id)
        ? [pathFilter.id, ...queryFromUrl.attrs]
        : queryFromUrl.attrs,
  };
  const [draft, setDraft] = useState(query.q);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDraft(query.q);
  }, [query.q]);

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

  const categoryMatch = pathname.match(/^\/designs\/category\/([^/]+)$/);
  const activeSlug = categoryMatch ? decodeURIComponent(categoryMatch[1]) : "";
  const activeRoot = shell.categories.find(
    (category) =>
      category.slug === activeSlug || category.children.some((child) => child.slug === activeSlug),
  );
  const allActive = pathname === "/designs" && query.viewAll;
  const filtered = query.attrs.length > 0 || query.subs.length > 0;

  function stay(patch: Partial<BrowseQueryState> = {}): string {
    const next = {
      q: query.q,
      sort: query.sort,
      attrs: query.attrs,
      subs: query.subs,
      viewAll: query.viewAll,
      page: 1,
      ...patch,
    };
    const base = pathFilter && !next.attrs.includes(pathFilter.id) ? "/designs" : pathname;
    return browseHref(base, next, filters);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    router.push(stay({ q: draft.trim() }), { scroll: false });
  }

  function changeSort(sort: BrowseSort): void {
    router.push(stay({ sort }), { scroll: false });
  }

  const sharedControls = {
    shell,
    query,
    activeSlug,
    activeRootSlug: activeRoot?.slug,
    allActive,
    filtered,
    opened,
    onToggleGroup: (id: string, open: boolean) => setOpened((current) => ({ ...current, [id]: open })),
    stay,
    clearHref: browseHref(pathname.startsWith("/designs/filter/") ? "/designs" : pathname, {
      q: query.q,
      sort: query.sort,
      viewAll: query.viewAll,
    }, filters),
  };

  const colorGroup = shell.groups.find((group) => group.slug === "colors");

  return (
    <div>
      <div className="mb-4 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <StorefrontToolbar
            colors={(colorGroup?.options ?? []).map((option) => ({
              id: option.id,
              label: option.label,
              active: query.attrs.includes(option.id),
              href: stay({ attrs: toggleBrowseToken(query.attrs, option.id) }),
            }))}
            sort={query.sort}
            onSort={changeSort}
            searchValue={draft}
            onSearchValue={setDraft}
            onSearch={submitSearch}
          />
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="browse-filters"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-bold lg:hidden"
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

      <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside data-route-loader-ignore="true" className="hidden lg:block">
          <BrowseControls {...sharedControls} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      <div
        data-route-loader-ignore="true"
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          drawerOpen ? "visible" : "invisible pointer-events-none",
        )}
        inert={drawerOpen ? undefined : true}
      >
        <button
          type="button"
          aria-label="بستن فیلترها"
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          id="browse-filters"
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
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border"
              aria-label="بستن"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <BrowseControls {...sharedControls} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowseControls({
  shell,
  query,
  activeSlug,
  activeRootSlug,
  allActive,
  filtered,
  opened,
  onToggleGroup,
  stay,
  clearHref,
}: {
  shell: BrowseShell;
  query: BrowseQueryState;
  activeSlug: string;
  activeRootSlug?: string;
  allActive: boolean;
  filtered: boolean;
  opened: Record<string, boolean>;
  onToggleGroup: (id: string, open: boolean) => void;
  stay: (patch?: Partial<BrowseQueryState>) => string;
  clearHref: string;
}) {
  return (
    <div className="space-y-5">
      <nav aria-label="دسته‌ها" className="space-y-1">
        <h2 className="flex items-center gap-2 px-2 text-xs font-bold text-cyan-300">
          <LayoutMark />
          دسته‌ها
        </h2>
        <CategoryRow
          href={browseHref("/designs", { viewAll: true })}
          active={allActive}
          icon={allDesignsVisual.icon}
          accent={allDesignsVisual.accent}
          label="همه طرح‌ها"
        />
        {shell.categories.map((category) => (
          <CategoryBranch
            key={category.slug}
            category={category}
            activeSlug={activeSlug}
            expanded={category.slug === activeRootSlug}
            subs={query.subs}
          />
        ))}
      </nav>

      <div className="space-y-2">
        {filtered ? (
          <BrowseLink href={clearHref} className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-300">
            پاک کردن فیلترها
          </BrowseLink>
        ) : null}
        {shell.groups.map((group) => {
          const open = group.id in opened ? opened[group.id] : true;
          return (
            <FilterGroup
              key={group.id}
              group={group}
              open={open ?? false}
              selected={query.attrs}
              onToggle={() => onToggleGroup(group.id, !open)}
              hrefFor={(id) => stay({ attrs: toggleBrowseToken(query.attrs, id) })}
            />
          );
        })}
      </div>
    </div>
  );
}

function LayoutMark() {
  const Icon = allDesignsVisual.icon;
  return <Icon className="h-3.5 w-3.5" aria-hidden />;
}

function categoryClass(active: boolean, accent: Accent): string {
  return cn(
    "flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm",
    active ? cn("font-bold", accent.soft, accent.text) : "text-muted hover:bg-card hover:text-foreground",
  );
}

function CategoryRow({
  href,
  active,
  icon: Icon,
  accent,
  label,
  count,
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  accent: Accent;
  label: string;
  count?: number;
}) {
  return (
    <BrowseLink
      href={href}
      showLoader
      aria-current={active ? "page" : undefined}
      className={categoryClass(active, accent)}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", accent.soft, accent.text)}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? (
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", accent.soft, accent.text)}>
          {count.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </BrowseLink>
  );
}

function CategoryBranch({
  category,
  activeSlug,
  expanded,
  subs,
}: {
  category: BrowseCategoryNode;
  activeSlug: string;
  expanded: boolean;
  subs: string[];
}) {
  const visual = categoryVisual(category.slug);
  const rootActive = category.slug === activeSlug;
  return (
    <div>
      <CategoryRow
        href={category.href}
        active={rootActive}
        icon={visual.icon}
        accent={visual.accent}
        label={category.name}
        count={category.count}
      />
      {expanded && category.children.length > 0 ? (
        <div className="mt-0.5 space-y-0.5 ps-4">
          {category.children.map((child) => {
            const active = child.slug === activeSlug || subs.includes(child.slug);
            return (
              <CategoryRow
                key={child.slug}
                href={child.href}
                active={active}
                icon={visual.icon}
                accent={visual.accent}
                label={child.name}
                count={child.count}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  group,
  open,
  selected,
  onToggle,
  hrefFor,
}: {
  group: BrowseFilterGroup;
  open: boolean;
  selected: string[];
  onToggle: () => void;
  hrefFor: (id: string) => string;
}) {
  const visual = filterVisual(group.slug);
  const Icon = visual.icon;
  const swatches = group.slug === "colors";
  return (
    <section aria-label={group.label}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-sm font-bold text-foreground"
      >
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", visual.accent.soft, visual.accent.text)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-start">{group.label}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted transition", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div className="flex flex-wrap gap-1.5 px-2 pb-2">
          {group.options.map((option) => {
            const active = selected.includes(option.id);
            const swatch = swatches ? colorSwatch(option.label) : null;
            return (
              <BrowseLink
                key={option.id}
                href={hrefFor(option.id)}
                showLoader
                loaderAccent={swatches ? swatchLoaderAccent(option.label) : filterToneHex(group.slug)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-2.5 text-xs font-semibold",
                  active
                    ? cn(visual.accent.chip, "ring-2 ring-offset-2 ring-offset-background", visual.accent.ring)
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                {swatch === "split" ? (
                  <span
                    aria-hidden
                    className="h-5 w-5 shrink-0 rounded-full border border-white/30 bg-[conic-gradient(#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7,#ef4444)]"
                  />
                ) : swatch ? (
                  <span
                    aria-hidden
                    className="h-5 w-5 shrink-0 rounded-full border border-white/30"
                    style={{ backgroundColor: swatch }}
                  />
                ) : null}
                {option.label}
              </BrowseLink>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

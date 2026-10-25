"use client";

import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";

import BrowseLink from "@/app/components/designs/BrowseLink";
import {
  allDesignsVisual,
  categoryVisual,
  colorSwatch,
  filterVisual,
  type Accent,
} from "@/app/components/designs/browse-visuals";
import {
  browseHref,
  browseQueryFromParams,
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

const fieldClass =
  "min-h-11 w-full rounded-xl border border-border bg-input-bg px-3 text-sm text-foreground outline-none focus:border-cyan-500";

export default function CatalogBrowseChrome({ shell, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = browseQueryFromParams(params);
  const [draft, setDraft] = useState(query.q);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const searchId = useId();

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
    return browseHref(pathname, {
      q: query.q,
      sort: query.sort,
      attrs: query.attrs,
      subs: query.subs,
      viewAll: query.viewAll,
      page: 1,
      ...patch,
    });
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
    draft,
    activeSlug,
    activeRootSlug: activeRoot?.slug,
    allActive,
    filtered,
    opened,
    onDraft: setDraft,
    onSearch: submitSearch,
    onSort: changeSort,
    onToggleGroup: (id: string, open: boolean) => setOpened((current) => ({ ...current, [id]: open })),
    stay,
    clearHref: browseHref(pathname, { q: query.q, sort: query.sort, viewAll: query.viewAll }),
  };

  return (
    <div>
      <div
        data-route-loader-ignore="true"
        className="sticky top-[4.5rem] z-30 -mx-4 mb-4 space-y-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden"
      >
        <div className="flex items-center gap-2">
          <SearchForm
            id={`${searchId}-mobile`}
            draft={draft}
            onDraft={setDraft}
            onSubmit={submitSearch}
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="browse-filters"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border px-3 text-sm font-bold"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            فیلتر
            {query.attrs.length > 0 ? (
              <span className="rounded-full bg-cyan-500/20 px-1.5 text-xs text-cyan-300">
                {query.attrs.length.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <CategoryChip
            href={browseHref("/designs", { viewAll: true })}
            active={allActive}
            icon={allDesignsVisual.icon}
            accent={allDesignsVisual.accent}
            label="همه"
          />
          {shell.categories.map((category) => {
            const visual = categoryVisual(category.slug);
            return (
              <CategoryChip
                key={category.slug}
                href={category.href}
                active={activeRoot?.slug === category.slug}
                icon={visual.icon}
                accent={visual.accent}
                label={category.name}
              />
            );
          })}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside data-route-loader-ignore="true" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pe-1">
            <BrowseControls {...sharedControls} instance="sidebar" searchId={searchId} />
          </div>
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
            <BrowseControls {...sharedControls} instance="drawer" searchId={searchId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function chipClass(active: boolean, accent: Accent): string {
  return cn(
    "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
    active ? accent.chip : "border-border text-muted",
  );
}

function CategoryChip({
  href,
  active,
  icon: Icon,
  accent,
  label,
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  accent: Accent;
  label: string;
}) {
  return (
    <BrowseLink href={href} aria-current={active ? "page" : undefined} className={chipClass(active, accent)}>
      <Icon className={cn("h-3.5 w-3.5", accent.text)} aria-hidden />
      {label}
    </BrowseLink>
  );
}

function SearchForm({
  id,
  draft,
  onDraft,
  onSubmit,
  className,
  labelled = false,
}: {
  id: string;
  draft: string;
  onDraft: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
  labelled?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} role="search" className={className}>
      <label htmlFor={id} className={labelled ? "mb-1 flex items-center gap-1.5 text-xs font-bold text-cyan-300" : "sr-only"}>
        <Search className="h-3.5 w-3.5" aria-hidden />
        جستجو
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" aria-hidden />
        <input
          id={id}
          type="search"
          value={draft}
          placeholder="نام طرح"
          onChange={(event) => onDraft(event.target.value)}
          className={`${fieldClass} ps-10`}
        />
      </div>
    </form>
  );
}

function SortField({
  id,
  sort,
  onSort,
}: {
  id: string;
  sort: BrowseSort;
  onSort: (sort: BrowseSort) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-300">
        <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
        مرتب‌سازی
      </span>
      <select
        id={id}
        value={sort}
        onChange={(event) => onSort(event.target.value as BrowseSort)}
        className={`${fieldClass} mt-1`}
      >
        <option value="featured">پیشنهادی</option>
        <option value="newest">جدیدترین</option>
        <option value="title">عنوان</option>
      </select>
    </label>
  );
}

function BrowseControls({
  shell,
  query,
  draft,
  searchId,
  instance,
  activeSlug,
  activeRootSlug,
  allActive,
  filtered,
  opened,
  onDraft,
  onSearch,
  onSort,
  onToggleGroup,
  stay,
  clearHref,
}: {
  shell: BrowseShell;
  query: BrowseQueryState;
  draft: string;
  searchId: string;
  instance: "sidebar" | "drawer";
  activeSlug: string;
  activeRootSlug?: string;
  allActive: boolean;
  filtered: boolean;
  opened: Record<string, boolean>;
  onDraft: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onSort: (sort: BrowseSort) => void;
  onToggleGroup: (id: string, open: boolean) => void;
  stay: (patch?: Partial<BrowseQueryState>) => string;
  clearHref: string;
}) {
  return (
    <div className="space-y-5">
      <div className="hidden space-y-3 lg:block">
        <SearchForm
          id={`${searchId}-${instance}-search`}
          draft={draft}
          onDraft={onDraft}
          onSubmit={onSearch}
          labelled
        />
        <SortField id={`${searchId}-${instance}-sort`} sort={query.sort} onSort={onSort} />
      </div>
      <div className="lg:hidden">
        <SortField id={`${searchId}-${instance}-sort-drawer`} sort={query.sort} onSort={onSort} />
      </div>

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
          const open = group.id in opened
            ? opened[group.id]
            : group.options.some((option) => query.attrs.includes(option.id));
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
    <BrowseLink href={href} aria-current={active ? "page" : undefined} className={categoryClass(active, accent)}>
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

"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Search, SlidersHorizontal, X, type LucideIcon } from "lucide-react";

import {
  allDesignsVisual,
  categoryVisual,
  colorSwatch,
  filterVisual,
  type Accent,
} from "@/app/components/designs/browse-visuals";
import {
  filterEditorDesigns,
  type EditorDesignPicker,
  type EditorPickerDesign,
  type EditorPickerSort,
} from "@/lib/catalog/editor-picker";
import { useGuestEditGate } from "@/app/components/case-editor/EditorGuestGate";
import { useEditorStore } from "@/lib/design/editor-store";
import { designedAssetUrl } from "@/lib/designed-assets";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 18;

type Props = {
  picker: EditorDesignPicker;
};

function toggleId(values: string[], id: string): string[] {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

export default function DesignPickerPanel({ picker }: Props) {
  const addDesignImage = useEditorStore((s) => s.addDesignImage);
  const { requireAccount } = useGuestEditGate();
  const searchId = useId();
  const sortId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [childIds, setChildIds] = useState<string[]>([]);
  const [attributeIds, setAttributeIds] = useState<string[]>([]);
  const [sort, setSort] = useState<EditorPickerSort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [addedId, setAddedId] = useState<string | null>(null);

  const category = picker.categories.find((item) => item.id === categoryId);
  const filtered = useMemo(
    () =>
      filterEditorDesigns(picker, {
        q: query,
        categoryId,
        childIds,
        attributeValueIds: attributeIds,
        sort,
      }),
    [picker, query, categoryId, childIds, attributeIds, sort],
  );
  const visible = filtered.slice(0, visibleCount);
  const narrowed =
    query.trim().length > 0 || Boolean(categoryId) || childIds.length > 0 || attributeIds.length > 0;

  const selectedLabels = useMemo(() => {
    const labels = new Map<string, string>();
    for (const group of picker.groups) {
      for (const option of group.options) labels.set(option.id, option.label);
    }
    for (const item of picker.categories) {
      for (const child of item.children) labels.set(child.id, child.name);
    }
    return labels;
  }, [picker]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, categoryId, childIds, attributeIds, sort]);

  useEffect(() => {
    if (!addedId) return;
    const timer = window.setTimeout(() => setAddedId(null), 700);
    return () => window.clearTimeout(timer);
  }, [addedId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollerRef.current;
    if (!sentinel || !root || visibleCount >= filtered.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
        }
      },
      { root, rootMargin: "160px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  function chooseCategory(next: string | undefined) {
    setCategoryId(next);
    setChildIds([]);
  }

  function clearFilters() {
    setQuery("");
    setCategoryId(undefined);
    setChildIds([]);
    setAttributeIds([]);
  }

  function applyDesign(design: EditorPickerDesign) {
    requireAccount(() => {
      addDesignImage(design.src, design.width, design.height, design.title);
      setAddedId(design.id);
    });
  }

  const pills = [...childIds, ...attributeIds].flatMap((id) => {
    const label = selectedLabels.get(id);
    return label ? [{ id, label, child: childIds.includes(id) }] : [];
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="min-h-0 max-h-[58%] space-y-2 overflow-y-auto">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            جستجوی طرح
          </label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300"
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={query}
            placeholder="نام طرح"
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-10 w-full rounded-xl border border-border bg-input-bg ps-9 pe-9 text-sm text-foreground outline-none focus:border-cyan-500"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute end-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-foreground"
              aria-label="پاک کردن جستجو"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label="دسته‌ها">
          <CategoryChip
            active={!categoryId}
            label="همه"
            count={picker.designs.length}
            accent={allDesignsVisual.accent}
            icon={allDesignsVisual.icon}
            onClick={() => chooseCategory(undefined)}
          />
          {picker.categories.map((item) => {
            const visual = categoryVisual(item.slug);
            return (
              <CategoryChip
                key={item.id}
                active={categoryId === item.id}
                label={item.name}
                count={item.count}
                accent={visual.accent}
                icon={visual.icon}
                onClick={() => chooseCategory(item.id)}
              />
            );
          })}
        </div>

        {category && category.children.length > 0 ? (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label="زیردسته‌ها">
            <button
              type="button"
              onClick={() => setChildIds([])}
              aria-pressed={childIds.length === 0}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center rounded-full border px-2.5 text-[11px] font-semibold",
                childIds.length === 0
                  ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              همه {category.name}
            </button>
            {category.children.map((child) => {
              const active = childIds.includes(child.id);
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setChildIds((current) => toggleId(current, child.id))}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold",
                    active
                      ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {child.name}
                  <span className="text-[10px] opacity-70">{child.count.toLocaleString("fa-IR")}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold",
              filtersOpen || attributeIds.length > 0
                ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                : "border-border text-foreground",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            فیلتر
            {attributeIds.length > 0 ? (
              <span className="rounded-full bg-cyan-500/25 px-1.5 text-[10px]">
                {attributeIds.length.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </button>
          <p className="min-w-0 flex-1 truncate text-[11px] text-muted">
            {filtered.length.toLocaleString("fa-IR")} طرح
          </p>
          <label htmlFor={sortId} className="sr-only">
            مرتب‌سازی
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(event) => setSort(event.target.value as EditorPickerSort)}
            className="h-10 max-w-[8.5rem] rounded-xl border border-border bg-input-bg px-2 text-xs text-foreground outline-none focus:border-cyan-500"
          >
            <option value="featured">پیشنهادی</option>
            <option value="newest">جدیدترین</option>
            <option value="title">عنوان</option>
          </select>
        </div>

        {filtersOpen ? (
          <div className="max-h-40 space-y-3 overflow-y-auto rounded-xl border border-border bg-card/80 p-2.5">
            {picker.groups.length === 0 ? (
              <p className="text-xs text-muted">فیلتری برای این طرح‌ها نیست.</p>
            ) : (
              picker.groups.map((group) => {
                const visual = filterVisual(group.slug);
                const Icon = visual.icon;
                return (
                  <section key={group.id} aria-label={group.label} className="space-y-1.5">
                    <h3 className={cn("flex items-center gap-1.5 text-[11px] font-bold", visual.accent.text)}>
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {group.label}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {group.options.map((option) => (
                        <FilterOption
                          key={option.id}
                          label={option.label}
                          swatches={group.slug === "colors"}
                          selected={attributeIds.includes(option.id)}
                          onClick={() => setAttributeIds((current) => toggleId(current, option.id))}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        ) : null}

        {pills.length > 0 || narrowed ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {pills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() =>
                  pill.child
                    ? setChildIds((current) => toggleId(current, pill.id))
                    : setAttributeIds((current) => toggleId(current, pill.id))
                }
                className="inline-flex min-h-8 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 text-[11px] font-semibold text-cyan-100"
              >
                {pill.label}
                <X className="h-3 w-3" aria-hidden />
                <span className="sr-only">حذف</span>
              </button>
            ))}
            {narrowed ? (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-8 px-1 text-[11px] font-bold text-cyan-300"
              >
                پاک کردن فیلترها
              </button>
            ) : null}
          </div>
        ) : null}

        <p className="text-[11px] leading-relaxed text-muted">
          اولین طرح تمام قاب را می‌پوشاند و طرح‌های بعدی کوچک روی آن می‌نشینند.
        </p>
      </div>

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-label="طرح‌ها"
      >
        {picker.designs.length === 0 ? (
          <p className="rounded-xl border border-border px-3 py-8 text-center text-xs text-muted">
            طرح آماده‌ای موجود نیست.
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border px-3 py-8 text-center">
            <p className="text-xs text-muted">طرحی با این انتخاب پیدا نشد.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 min-h-10 rounded-xl border border-cyan-400/50 px-3 text-xs font-bold text-cyan-200"
            >
              پاک کردن فیلترها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((design) => {
              const added = addedId === design.id;
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => applyDesign(design)}
                  title={design.title}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl border bg-card/70 text-right transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-md",
                    added ? "border-cyan-300 ring-2 ring-cyan-300/70" : "border-border",
                  )}
                >
                  <span className="relative aspect-square bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.16),transparent_62%)]">
                    <Image
                      src={designedAssetUrl(design.thumb || design.src)}
                      alt={design.title}
                      fill
                      sizes="140px"
                      className="object-contain p-1.5"
                    />
                    {added ? (
                      <span className="absolute end-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300 text-black">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                    ) : null}
                  </span>
                  <span className="line-clamp-2 px-2 py-1.5 text-[11px] font-medium text-muted group-hover:text-foreground">
                    {design.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {visibleCount < filtered.length ? (
          <div ref={sentinelRef} className="py-3 text-center text-[10px] text-muted">
            در حال بارگذاری…
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  label,
  count,
  accent,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  accent: Accent;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold",
        active ? accent.chip : "border-border text-muted hover:text-foreground",
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", accent.text)} aria-hidden />
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px]", accent.soft, accent.text)}>
        {count.toLocaleString("fa-IR")}
      </span>
    </button>
  );
}

function FilterOption({
  label,
  selected,
  swatches,
  onClick,
}: {
  label: string;
  selected: boolean;
  swatches: boolean;
  onClick: () => void;
}) {
  const color = swatches ? colorSwatch(label) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold",
        selected
          ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
          : "border-border text-muted hover:text-foreground",
      )}
    >
      {color === "split" ? (
        <span
          className="h-3.5 w-3.5 rounded-full bg-[conic-gradient(#ef4444,#eab308,#22c55e,#3b82f6,#a855f7,#ef4444)]"
          aria-hidden
        />
      ) : color ? (
        <span
          className="h-3.5 w-3.5 rounded-full border border-white/30"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ) : null}
      {label}
    </button>
  );
}

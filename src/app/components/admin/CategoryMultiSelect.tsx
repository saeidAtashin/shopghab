"use client";

import { useEffect, useMemo, useState } from "react";

import type { CategoryRecord } from "@/lib/catalog/schema";

function parentName(categories: CategoryRecord[], category: CategoryRecord): string {
  if (!category.parentId) return "ریشه";
  return categories.find((item) => item.id === category.parentId)?.name ?? "—";
}

function categoryLabel(categories: CategoryRecord[], category: CategoryRecord): string {
  const parent = category.parentId
    ? categories.find((item) => item.id === category.parentId)
    : undefined;
  return parent ? `${parent.name} / ${category.name}` : category.name;
}

function ancestorIds(categories: CategoryRecord[], selectedIds: string[]): string[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const open = new Set<string>();
  for (const id of selectedIds) {
    let parentId = byId.get(id)?.parentId ?? null;
    while (parentId) {
      open.add(parentId);
      parentId = byId.get(parentId)?.parentId ?? null;
    }
  }
  return [...open];
}

type Props = {
  categories: CategoryRecord[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function CategoryMultiSelect({ categories, selectedIds, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(() => ancestorIds(categories, selectedIds));
  const byParent = useMemo(() => {
    const map = new Map<string | null, CategoryRecord[]>();
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fa"));
    for (const category of sorted) {
      const key = category.parentId;
      const list = map.get(key) ?? [];
      list.push(category);
      map.set(key, list);
    }
    return map;
  }, [categories]);

  useEffect(() => {
    setOpenIds((current) => {
      const next = new Set(current);
      for (const id of ancestorIds(categories, selectedIds)) next.add(id);
      return next.size === current.length ? current : [...next];
    });
  }, [categories, selectedIds]);

  const selected = categories.filter((category) => selectedIds.includes(category.id));
  const normalized = query.trim();
  const matches = normalized
    ? categories.filter(
        (category) =>
          category.name.includes(normalized) || category.slug.includes(normalized.toLowerCase()),
      )
    : [];

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  function toggleOpen(id: string) {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function renderNode(category: CategoryRecord) {
    const children = byParent.get(category.id) ?? [];
    const open = openIds.includes(category.id);
    const checked = selectedIds.includes(category.id);
    const expanded = open && children.length > 0;
    return (
      <li key={category.id} className={expanded ? "col-span-full" : undefined}>
        <div className="flex items-center gap-1">
          {children.length > 0 ? (
            <button
              type="button"
              className="grid h-11 w-9 shrink-0 place-items-center rounded-xl text-sm text-muted hover:bg-white/5"
              aria-expanded={open}
              aria-label={`${open ? "بستن" : "باز کردن"} ${category.name}`}
              onClick={() => toggleOpen(category.id)}
            >
              {open ? "−" : "+"}
            </button>
          ) : null}
          <button
            type="button"
            aria-pressed={checked}
            onClick={() => toggle(category.id)}
            className={`flex min-h-11 flex-1 items-center gap-2 rounded-2xl px-3 text-sm ${
              checked ? "bg-cyan-500/15 text-cyan-100" : "hover:bg-white/5"
            }`}
          >
            <ChoiceMark checked={checked} />
            <span className="text-start">{category.name}</span>
          </button>
        </div>
        {expanded ? (
          <ul className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
            {children.map((child) => renderNode(child))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <fieldset className="rounded-3xl border border-border p-4">
      <legend className="px-2 text-sm">دسته‌ها</legend>
      <p className="mb-3 text-xs text-muted">انتخاب یک دسته والد، زیردسته‌های آن را خودکار انتخاب نمی‌کند.</p>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="جستجو با نام یا اسلاگ"
        className="mb-3 w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500"
        aria-label="جستجوی دسته"
      />
      {selected.length > 0 ? (
        <ul className="mb-3 flex flex-wrap gap-2">
          {selected.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => toggle(category.id)}
                className="min-h-11 rounded-full bg-cyan-500/15 px-4 py-2 text-sm text-cyan-300"
              >
                {categoryLabel(categories, category)} ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-xs text-muted">دسته‌ای انتخاب نشده است.</p>
      )}
      {categories.length === 0 ? <p className="text-sm text-muted">دسته‌ای ثبت نشده است.</p> : null}
      {normalized ? (
        matches.length === 0 ? (
          <p className="text-sm text-muted">دسته‌ای با این عبارت پیدا نشد.</p>
        ) : (
          <ul className="grid max-h-80 grid-cols-2 gap-2 overflow-auto md:grid-cols-3">
            {matches.map((category) => {
              const checked = selectedIds.includes(category.id);
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    aria-pressed={checked}
                    onClick={() => toggle(category.id)}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-sm ${
                      checked ? "bg-cyan-500/15 text-cyan-100" : "hover:bg-white/5"
                    }`}
                  >
                    <ChoiceMark checked={checked} />
                    <span>{categoryLabel(categories, category)}</span>
                    <span className="text-xs text-muted">{parentName(categories, category)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <ul className="grid max-h-80 grid-cols-2 gap-2 overflow-auto md:grid-cols-3">
          {(byParent.get(null) ?? []).map((category) => renderNode(category))}
        </ul>
      )}
    </fieldset>
  );
}

function ChoiceMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-xs ${
        checked ? "border-cyan-400 bg-cyan-500 text-black" : "border-border"
      }`}
      aria-hidden
    >
      {checked ? "✓" : ""}
    </span>
  );
}

"use client";

import { useMemo, useState } from "react";

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

type Props = {
  categories: CategoryRecord[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function CategoryMultiSelect({ categories, selectedIds, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>([]);
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

  function renderNode(category: CategoryRecord, depth: number) {
    const children = byParent.get(category.id) ?? [];
    const open = openIds.includes(category.id);
    return (
      <li key={category.id}>
        <div className="flex items-center gap-2 py-1" style={{ paddingInlineStart: depth * 16 }}>
          {children.length > 0 ? (
            <button
              type="button"
              className="w-6 text-xs text-muted"
              aria-expanded={open}
              onClick={() =>
                setOpenIds((current) =>
                  current.includes(category.id)
                    ? current.filter((id) => id !== category.id)
                    : [...current, category.id],
                )
              }
            >
              {open ? "−" : "+"}
            </button>
          ) : (
            <span className="w-6" />
          )}
          <label className="flex flex-1 items-center gap-2 text-sm">
            <input type="checkbox" checked={selectedIds.includes(category.id)} onChange={() => toggle(category.id)} />
            <span>{category.name}</span>
            <span className="text-xs text-muted">{category.slug}</span>
          </label>
        </div>
        {open && children.length > 0 ? <ul>{children.map((child) => renderNode(child, depth + 1))}</ul> : null}
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
                className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-300"
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
          <ul className="max-h-72 space-y-1 overflow-auto">
            {matches.map((category) => (
              <li key={category.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(category.id)}
                    onChange={() => toggle(category.id)}
                  />
                  <span>{categoryLabel(categories, category)}</span>
                  <span className="text-xs text-muted">{parentName(categories, category)}</span>
                </label>
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className="max-h-72 overflow-auto">
          {(byParent.get(null) ?? []).map((category) => renderNode(category, 0))}
        </ul>
      )}
    </fieldset>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import type { CategoryRecord, CategoryStatus } from "@/lib/catalog/schema";

const STATUS_LABEL: Record<CategoryStatus, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  archived: "بایگانی",
};

function compareCategories(a: CategoryRecord, b: CategoryRecord): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "fa");
}

export default function CategoryAdminList() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    const body = await adminJson<{ categories: CategoryRecord[]; designCounts: Record<string, number> }>(
      "/api/admin/catalog/categories",
    );
    setCategories(body.categories);
    setCounts(body.designCounts);
  }

  useEffect(() => {
    let active = true;
    async function fetchCategories() {
      try {
        const body = await adminJson<{ categories: CategoryRecord[]; designCounts: Record<string, number> }>(
          "/api/admin/catalog/categories",
        );
        if (!active) return;
        setCategories(body.categories);
        setCounts(body.designCounts);
      } catch (reason: unknown) {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "دریافت دسته‌ها انجام نشد");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  const byParent = useMemo(() => {
    const map = new Map<string | null, CategoryRecord[]>();
    const sorted = [...categories].sort(compareCategories);
    for (const category of sorted) {
      const list = map.get(category.parentId) ?? [];
      list.push(category);
      map.set(category.parentId, list);
    }
    return map;
  }, [categories]);

  const visibleIds = useMemo(() => {
    const text = query.trim();
    if (!text) return null;
    const ids = new Set<string>();
    for (const category of categories) {
      const hit = category.name.includes(text) || category.slug.includes(text.toLowerCase());
      if (!hit) continue;
      ids.add(category.id);
      let parentId = category.parentId;
      const seen = new Set<string>();
      while (parentId && !seen.has(parentId)) {
        seen.add(parentId);
        ids.add(parentId);
        parentId = categories.find((item) => item.id === parentId)?.parentId ?? null;
      }
    }
    return ids;
  }, [categories, query]);

  async function move(category: CategoryRecord, direction: -1 | 1) {
    const siblings = byParent.get(category.parentId) ?? [];
    const index = siblings.findIndex((item) => item.id === category.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= siblings.length) return;
    const reordered = [...siblings];
    const [item] = reordered.splice(index, 1);
    if (!item) return;
    reordered.splice(target, 0, item);
    setBusyId(category.id);
    setError("");
    try {
      await adminJson("/api/admin/catalog/categories/reorder", {
        method: "POST",
        body: JSON.stringify({
          items: reordered.map((entry, order) => ({ id: entry.id, sortOrder: (order + 1) * 10 })),
        }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تغییر ترتیب انجام نشد");
    } finally {
      setBusyId("");
    }
  }

  async function setStatus(category: CategoryRecord, status: CategoryStatus) {
    setBusyId(category.id);
    setError("");
    try {
      await adminJson(`/api/admin/catalog/categories/${category.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تغییر وضعیت انجام نشد");
    } finally {
      setBusyId("");
    }
  }

  function renderNode(category: CategoryRecord, depth: number) {
    if (visibleIds && !visibleIds.has(category.id)) return null;
    const children = byParent.get(category.id) ?? [];
    const open = Boolean(query.trim()) || openIds.includes(category.id);
    const parent = categories.find((item) => item.id === category.parentId);
    return (
      <li key={category.id} className="border-b border-border/60 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3" style={{ paddingInlineStart: depth * 20 }}>
          <div className="flex items-start gap-2">
            {children.length > 0 ? (
              <button
                type="button"
                className="mt-1 w-6 text-sm text-muted"
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
            <div>
              <h2 className="font-bold">{category.name}</h2>
              <p className="text-xs text-muted">
                {category.slug}
                {" · "}
                والد: {parent?.name ?? "ریشه"}
                {" · "}
                {counts[category.id] ?? 0} طرح
                {" · "}
                {STATUS_LABEL[category.status]}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busyId === category.id} onClick={() => void move(category, -1)} className="rounded-2xl border border-border px-3 py-1 text-xs">بالا</button>
            <button type="button" disabled={busyId === category.id} onClick={() => void move(category, 1)} className="rounded-2xl border border-border px-3 py-1 text-xs">پایین</button>
            <Link href={`/admin/categories/new?parent=${category.id}`} className="rounded-2xl border border-border px-3 py-1 text-xs">زیردسته</Link>
            <Link href={`/admin/categories/${category.id}`} className="rounded-2xl border border-border px-3 py-1 text-xs">ویرایش</Link>
            {category.status === "active" ? (
              <button type="button" disabled={busyId === category.id} onClick={() => void setStatus(category, "inactive")} className="rounded-2xl border border-border px-3 py-1 text-xs">غیرفعال</button>
            ) : (
              <button type="button" disabled={busyId === category.id} onClick={() => void setStatus(category, "active")} className="rounded-2xl border border-border px-3 py-1 text-xs">فعال</button>
            )}
            {category.status !== "archived" ? (
              <button type="button" disabled={busyId === category.id} onClick={() => void setStatus(category, "archived")} className="rounded-2xl border border-border px-3 py-1 text-xs">بایگانی</button>
            ) : null}
          </div>
        </div>
        {open && children.length > 0 ? <ul>{children.map((child) => renderNode(child, depth + 1))}</ul> : null}
      </li>
    );
  }

  const roots = byParent.get(null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجو با نام فارسی یا اسلاگ"
          aria-label="جستجوی دسته"
          className="w-full max-w-md rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500"
        />
        <Link href="/admin/categories/new" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black">
          دسته جدید
        </Link>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-muted">در حال دریافت دسته‌ها...</p> : null}
      {!loading && categories.length === 0 ? (
        <p className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">دسته‌ای ثبت نشده است.</p>
      ) : null}
      {!loading && query.trim() && visibleIds?.size === 0 ? (
        <p className="text-sm text-muted">دسته‌ای با این عبارت پیدا نشد.</p>
      ) : null}
      <ul className="rounded-3xl border border-border bg-surface px-4">
        {roots.map((category) => renderNode(category, 0))}
      </ul>
    </div>
  );
}

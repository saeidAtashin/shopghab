"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import type { CategoryRecord } from "@/lib/catalog/schema";

export default function CategoryAdminList() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void adminJson<{ categories: CategoryRecord[] }>("/api/admin/catalog/categories")
      .then((body) => setCategories(body.categories))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "دریافت دسته‌ها انجام نشد");
      })
      .finally(() => setLoading(false));
  }, []);

  const names = Object.fromEntries(categories.map((category) => [category.id, category.name]));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/admin/categories/new" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black">
          دسته جدید
        </Link>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-muted">در حال دریافت دسته‌ها...</p> : null}
      {!loading && categories.length === 0 ? (
        <p className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">دسته‌ای ثبت نشده است.</p>
      ) : null}
      <div className="grid gap-3">
        {categories.map((category) => (
          <article key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4">
            <div>
              <h2 className="font-bold">{category.name}</h2>
              <p className="text-xs text-muted">
                {category.slug}
                {category.parentId ? ` · والد: ${names[category.parentId] ?? category.parentId}` : ""}
                {category.status === "archived" ? " · بایگانی" : ""}
              </p>
            </div>
            <Link href={`/admin/categories/${category.id}`} className="rounded-2xl border border-border px-4 py-2 text-sm">
              ویرایش
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

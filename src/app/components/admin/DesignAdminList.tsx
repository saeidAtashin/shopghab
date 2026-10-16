"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import { designedAssetUrl } from "@/lib/designed-assets";
import type { CategoryRecord, DesignRecord, DesignStatus } from "@/lib/catalog/schema";

const STATUS_LABEL: Record<DesignStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشر شده",
  archived: "بایگانی",
};

type ListResponse = {
  items: DesignRecord[];
  total: number;
  page: number;
  pageCount: number;
};

export default function DesignAdminList() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [items, setItems] = useState<DesignRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("all");
  const [missingSeo, setMissingSeo] = useState(false);
  const [missingImage, setMissingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void adminJson<{ categories: CategoryRecord[] }>("/api/admin/catalog/categories")
      .then((body) => setCategories(body.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (status !== "all") params.set("status", status);
    if (missingSeo) params.set("missingSeo", "1");
    if (missingImage) params.set("missingImage", "1");
    params.set("page", String(page));

    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      void adminJson<ListResponse>(`/api/admin/catalog/designs?${params.toString()}`)
        .then((body) => {
          setItems(body.items);
          setPageCount(body.pageCount);
          setTotal(body.total);
        })
        .catch((reason: unknown) => {
          setItems([]);
          setError(reason instanceof Error ? reason.message : "خطا در دریافت طرح‌ها");
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [q, categoryId, status, missingSeo, missingImage, page]);

  async function changeStatus(design: DesignRecord, next: DesignStatus) {
    setNotice("");
    setError("");
    try {
      const body = await adminJson<{ design: DesignRecord }>(
        `/api/admin/catalog/designs/${design.id}`,
        { method: "PATCH", body: JSON.stringify({ status: next }) },
      );
      setItems((current) => current.map((item) => (item.id === design.id ? body.design : item)));
      setNotice("وضعیت طرح ذخیره شد.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ذخیره وضعیت انجام نشد");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{total} طرح</p>
        <Link href="/admin/designs/new" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black">
          طرح جدید
        </Link>
      </div>

      <form
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
        }}
      >
        <input
          value={q}
          onChange={(event) => {
            setPage(1);
            setQ(event.target.value);
          }}
          placeholder="جستجو در عنوان، اسلاگ یا شناسه"
          className="rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500"
          aria-label="جستجو"
        />
        <select
          value={categoryId}
          onChange={(event) => {
            setPage(1);
            setCategoryId(event.target.value);
          }}
          className="rounded-2xl border border-border bg-input-bg px-4 py-3"
          aria-label="دسته"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="rounded-2xl border border-border bg-input-bg px-4 py-3"
          aria-label="وضعیت"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
          <option value="archived">بایگانی</option>
        </select>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={missingSeo}
              onChange={(event) => {
                setPage(1);
                setMissingSeo(event.target.checked);
              }}
            />
            بدون سئو
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={missingImage}
              onChange={(event) => {
                setPage(1);
                setMissingImage(event.target.checked);
              }}
            />
            بدون تصویر
          </label>
        </div>
      </form>

      {notice ? <p className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm">{notice}</p> : null}
      {error ? <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}

      {loading ? <p className="text-muted">در حال دریافت طرح‌ها...</p> : null}
      {!loading && items.length === 0 ? (
        <p className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">طرحی پیدا نشد.</p>
      ) : null}

      <div className="grid gap-4">
        {items.map((design) => {
          const image = design.thumbnailPath || design.imagePath;
          return (
            <article key={design.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4 md:flex-row md:items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-background">
                {image ? (
                  <Image src={designedAssetUrl(image)} alt={design.alt || design.title} fill sizes="80px" className="object-contain" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">{design.title}</h2>
                <p className="truncate text-xs text-muted">{design.slug} · {design.id}</p>
              </div>
              <label className="text-sm">
                <span className="mb-1 block text-muted">وضعیت</span>
                <select
                  value={design.status}
                  onChange={(event) => void changeStatus(design, event.target.value as DesignStatus)}
                  className="rounded-2xl border border-border bg-input-bg px-3 py-2"
                  aria-label={`وضعیت ${design.title}`}
                >
                  {(Object.keys(STATUS_LABEL) as DesignStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {STATUS_LABEL[key]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <Link href={`/admin/designs/${design.id}`} className="rounded-2xl border border-border px-4 py-2 text-sm">
                  ویرایش
                </Link>
                {design.status !== "archived" ? (
                  <button
                    type="button"
                    onClick={() => void changeStatus(design, "archived")}
                    className="rounded-2xl border border-border px-4 py-2 text-sm"
                  >
                    بایگانی
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-40">
            قبلی
          </button>
          <span className="text-sm text-muted">{page} / {pageCount}</span>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-40">
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}

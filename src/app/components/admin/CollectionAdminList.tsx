"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import type { CategoryStatus, CollectionRecord } from "@/lib/catalog/schema";

const STATUS_LABEL = {
  active: "فعال",
  inactive: "غیرفعال",
  archived: "بایگانی",
} as const;

export default function CollectionAdminList() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    void adminJson<{ collections: CollectionRecord[] }>("/api/admin/catalog/collections")
      .then((body) => setCollections(body.collections))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "دریافت کالکشن‌ها انجام نشد");
      })
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(collection: CollectionRecord, status: CategoryStatus) {
    setBusyId(collection.id);
    setError("");
    try {
      const body = await adminJson<{ collection: CollectionRecord }>(
        `/api/admin/catalog/collections/${collection.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            seoTitle: collection.seoTitle,
            seoDescription: collection.seoDescription,
            coverImage: collection.coverImage,
            status,
            sortOrder: collection.sortOrder,
          }),
        },
      );
      setCollections((current) =>
        current.map((item) => (item.id === collection.id ? body.collection : item)),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تغییر وضعیت انجام نشد");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/admin/collections/new" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black">
          کالکشن جدید
        </Link>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-muted">در حال دریافت کالکشن‌ها...</p> : null}
      {!loading && collections.length === 0 ? (
        <p className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">کالکشنی ثبت نشده است.</p>
      ) : null}
      <div className="grid gap-3">
        {collections.map((collection) => (
          <article
            key={collection.id}
            className="grid grid-cols-1 items-center gap-3 rounded-3xl border border-border bg-surface p-4 md:grid-cols-[minmax(0,1fr)_7rem_16rem]"
          >
            <div className="min-w-0">
              <h2 className="truncate font-bold">{collection.name}</h2>
              <p className="truncate text-xs text-muted">{collection.slug}</p>
            </div>
            <p className="text-sm">{STATUS_LABEL[collection.status]}</p>
            <div className="grid grid-cols-3 gap-2">
              {collection.status === "active" ? (
                <button
                  type="button"
                  disabled={busyId === collection.id}
                  onClick={() => void setStatus(collection, "inactive")}
                  className="rounded-2xl border border-border px-2 py-2 text-sm disabled:opacity-60"
                >
                  غیرفعال
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busyId === collection.id}
                  onClick={() => void setStatus(collection, "active")}
                  className="rounded-2xl border border-border px-2 py-2 text-sm disabled:opacity-60"
                >
                  فعال
                </button>
              )}
              {collection.status !== "archived" ? (
                <button
                  type="button"
                  disabled={busyId === collection.id}
                  onClick={() => void setStatus(collection, "archived")}
                  className="rounded-2xl border border-border px-2 py-2 text-sm disabled:opacity-60"
                >
                  بایگانی
                </button>
              ) : (
                <span />
              )}
              <Link href={`/admin/collections/${collection.id}`} className="rounded-2xl border border-border px-2 py-2 text-center text-sm">
                ویرایش
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

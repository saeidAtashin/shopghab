"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import type { CollectionRecord } from "@/lib/catalog/schema";

const STATUS_LABEL = {
  active: "فعال",
  inactive: "غیرفعال",
  archived: "بایگانی",
} as const;

export default function CollectionAdminList() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void adminJson<{ collections: CollectionRecord[] }>("/api/admin/catalog/collections")
      .then((body) => setCollections(body.collections))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "دریافت کالکشن‌ها انجام نشد");
      })
      .finally(() => setLoading(false));
  }, []);

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
          <article key={collection.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4">
            <div>
              <h2 className="font-bold">{collection.name}</h2>
              <p className="text-xs text-muted">
                {collection.slug} · {STATUS_LABEL[collection.status]}
              </p>
            </div>
            <Link href={`/admin/collections/${collection.id}`} className="rounded-2xl border border-border px-4 py-2 text-sm">
              ویرایش
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

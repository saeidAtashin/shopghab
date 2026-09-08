"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listUserDesigns } from "@/lib/design/api";
import type { SavedDesign } from "@/lib/design/types";

export default function DesignsDashboardClient() {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listUserDesigns().then((data) => {
      setDesigns(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-4 pt-24 pb-16 sm:px-6">
      <h1 className="text-2xl font-black text-foreground">طراحی‌های من</h1>
      <p className="mt-2 text-muted">طراحی‌های ذخیره‌شده شما</p>

      {loading ? (
        <p className="mt-8 text-muted">در حال بارگذاری...</p>
      ) : designs.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-muted">هنوز طراحی ذخیره نکرده‌اید</p>
          <Link href="/create" className="mt-4 inline-block text-cyan-400">
            شروع طراحی
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <li
              key={design.id}
              className="rounded-2xl border border-border bg-card/60 p-4"
            >
              <p className="font-bold text-foreground">{design.name}</p>
              <p className="mt-1 text-xs text-muted">
                {new Date(design.updatedAt).toLocaleDateString("fa-IR")}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/share/${design.shareToken}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground"
                >
                  مشاهده
                </Link>
                <Link
                  href={`/design/${design.brandSlug}/${design.modelSlug}/${design.caseTypeSlug}?design=${design.id}`}
                  className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs text-cyan-400"
                >
                  ویرایش
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

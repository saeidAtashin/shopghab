import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "../lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "صفحه پیدا نشد",
  description:
    "این آدرس در شاپ‌قاب وجود ندارد. به صفحه اصلی برگردید یا قاب‌های آماده را ببینید.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0c0a09] px-6 pt-20 text-white">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium text-amber-400">۴۰۴</p>
        <h1 className="mt-4 text-4xl font-black">صفحه پیدا نشد</h1>
        <p className="mt-4 leading-8 text-zinc-400">
          این مسیر در شاپ‌قاب وجود ندارد. می‌توانید به خانه برگردید یا کاتالوگ
          قاب‌ها را ببینید.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400"
          >
            صفحه اصلی
          </Link>
          <Link
            href="/cases"
            className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:border-amber-400/40"
          >
            قاب‌های آماده
          </Link>
          <Link
            href="/custom"
            className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:border-amber-400/40"
          >
            طراحی سفارشی
          </Link>
        </div>
      </div>
    </main>
  );
}

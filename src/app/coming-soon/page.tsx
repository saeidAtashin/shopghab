import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "../../lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "در حال ساخت",
  description:
    "این بخش سایت شاپ‌قاب هنوز در حال ساخت است. به زودی در دسترس قرار می‌گیرد.",
  path: "/coming-soon",
  noIndex: true,
});

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0c0a09] px-6 pt-20 text-white">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium text-amber-400">به‌زودی</p>
        <h1 className="mt-4 text-4xl font-black">این بخش در حال ساخت است</h1>
        <p className="mt-4 leading-8 text-zinc-400">
          تیم شاپ‌قاب روی این بخش کار می‌کند. فعلاً می‌توانید قاب‌های آماده را
          ببینید یا سفارش سفارشی ثبت کنید.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/cases"
            className="rounded-2xl bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400"
          >
            قاب‌های آماده
          </Link>
          <Link
            href="/custom"
            className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:border-amber-400/40"
          >
            طراحی سفارشی
          </Link>
          <Link
            href="/tracking"
            className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:border-amber-400/40"
          >
            پیگیری سفارش
          </Link>
        </div>
      </div>
    </main>
  );
}

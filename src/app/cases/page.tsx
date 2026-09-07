import Image from "next/image";
import Link from "next/link";

import PageShell from "@/app/components/seo/PageShell";
import {
  CASE_CATEGORY_LABELS,
  cases,
  formatCasePrice,
} from "@/lib/case-catalog";
import { createPageMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/app/components/seo/JsonLd";

const PATH = "/cases";
const TITLE = "قاب‌های آماده";
const DESCRIPTION =
  "مجموعه قاب گوشی‌های از پیش طراحی‌شده شاپ‌قاب برای آیفون، سامسونگ و شیائومی با چاپ باکیفیت.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "قاب گوشی آماده",
    "خرید قاب آیفون",
    "خرید قاب سامسونگ",
    "شاپ قاب",
  ],
});

export default function CasesPage() {
  const schema = [
    webPageJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH }),
    itemListJsonLd({
      name: TITLE,
      path: PATH,
      items: cases.map((item) => ({
        name: item.title,
        url: `/cases/${item.slug}`,
      })),
    }),
  ];

  return (
    <main className="min-h-screen bg-[#0c0a09] pt-24 text-white">
      <JsonLd data={schema} />
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-16"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-amber-400">کاتالوگ شاپ‌قاب</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">{TITLE}</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-400">{DESCRIPTION}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item) => (
            <Link
              key={item.slug}
              href={`/cases/${item.slug}`}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-amber-400/40 hover:bg-white/[0.05]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-900">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-white">{item.title}</h2>
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                    {CASE_CATEGORY_LABELS[item.category]}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm leading-7 text-zinc-400">
                  {item.description}
                </p>
                <p className="text-lg font-bold text-amber-400">
                  {formatCasePrice(item.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PageShell>
    </main>
  );
}

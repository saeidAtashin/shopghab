import Link from "next/link";
import { notFound } from "next/navigation";

import PageShell from "@/app/components/seo/PageShell";
import { consoleIds, getConsole } from "../../../lib/console-catalog";
import { webPageJsonLd } from "../../../lib/seo/jsonld";
import { createPageMetadata } from "../../../lib/seo/metadata";

type Props = {
  params: Promise<{ console: string }>;
};

export function generateStaticParams() {
  return consoleIds.map((console) => ({ console }));
}

export async function generateMetadata({ params }: Props) {
  const { console: consoleSlug } = await params;
  const config = getConsole(consoleSlug);

  if (!config) {
    return createPageMetadata({
      title: "صفحه یافت نشد",
      path: `/shop/${consoleSlug}`,
      noIndex: true,
    });
  }

  const path = `/shop/${config.id}`;

  return createPageMetadata({
    title: `فروش ${config.title}`,
    description: `خرید ${config.title} دست‌دوم تست‌شده — مشاوره قبل از خرید.`,
    path,
  });
}

export default async function ShopConsolePage({ params }: Props) {
  const { console: consoleSlug } = await params;
  const config = getConsole(consoleSlug);

  if (!config) notFound();

  const path = `/shop/${config.id}`;

  return (
    <main className="min-h-screen bg-[#050816] pt-24 text-white">
      <PageShell
        currentPath={path}
        jsonLd={webPageJsonLd({
          name: `فروش ${config.title}`,
          description: `فروش ${config.title}`,
          path,
        })}
        containerClassName="container mx-auto max-w-3xl px-6"
      >
        <h1 className="mb-6 text-4xl font-black">فروش {config.title}</h1>
        <p className="mb-10 text-lg text-zinc-400">
          برای استعلام موجودی و قیمت {config.title} با ما تماس بگیرید. دستگاه‌ها
          قبل از تحویل تست کامل می‌شوند.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/#contact"
            className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            استعلام قیمت
          </Link>
          <Link
            href={`/shop/${config.id}/parts`}
            className="rounded-2xl border border-white/10 px-8 py-4 transition hover:border-cyan-400/30"
          >
            فروش قطعات {config.title}
          </Link>
          <Link
            href={`/consoles/${config.id}`}
            className="rounded-2xl border border-white/10 px-8 py-4 transition hover:border-cyan-400/30"
          >
            بازگشت به خدمات {config.title}
          </Link>
        </div>
      </PageShell>
    </main>
  );
}

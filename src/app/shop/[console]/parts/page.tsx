import Link from "next/link";
import { notFound } from "next/navigation";

import PageShell from "@/app/components/seo/PageShell";
import { consoleIds, getConsole } from "../../../../lib/console-catalog";
import { webPageJsonLd } from "../../../../lib/seo/jsonld";
import { createPageMetadata } from "../../../../lib/seo/metadata";

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
      path: `/shop/${consoleSlug}/parts`,
      noIndex: true,
    });
  }

  const path = `/shop/${config.id}/parts`;

  return createPageMetadata({
    title: `فروش قطعات ${config.title}`,
    description: `قطعات اورجینال و سازگار با ${config.title}.`,
    path,
  });
}

export default async function ShopPartsPage({ params }: Props) {
  const { console: consoleSlug } = await params;
  const config = getConsole(consoleSlug);

  if (!config) notFound();

  const path = `/shop/${config.id}/parts`;

  return (
    <main className="min-h-screen bg-[#050816] pt-24 text-white">
      <PageShell
        currentPath={path}
        jsonLd={webPageJsonLd({
          name: `فروش قطعات ${config.title}`,
          description: `قطعات ${config.title}`,
          path,
        })}
        containerClassName="container mx-auto max-w-3xl px-6"
      >
        <h1 className="mb-6 text-4xl font-black">فروش قطعات {config.title}</h1>
        <p className="mb-10 text-lg text-zinc-400">
          فروش قطعات اورجینال و باکیفیت برای {config.title} شامل پاور، فن، HDMI
          و سایر قطعات سخت‌افزاری.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/#contact"
            className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            استعلام قطعه
          </Link>
          <Link
            href={`/services/${config.repairSlug}`}
            className="rounded-2xl border border-white/10 px-8 py-4 transition hover:border-cyan-400/30"
          >
            تعمیر {config.title}
          </Link>
          <Link
            href={`/shop/${config.id}`}
            className="rounded-2xl border border-white/10 px-8 py-4 transition hover:border-cyan-400/30"
          >
            فروش کنسول {config.title}
          </Link>
        </div>
      </PageShell>
    </main>
  );
}

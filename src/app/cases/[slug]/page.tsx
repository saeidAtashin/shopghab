import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import CaseOrderForm from "@/app/components/orders/CaseOrderForm";
import JsonLd from "@/app/components/seo/JsonLd";
import PageShell from "@/app/components/seo/PageShell";
import {
  CASE_CATEGORY_LABELS,
  cases,
  formatCasePrice,
  getCaseBySlug,
} from "@/lib/case-catalog";
import { createPageMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return cases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = getCaseBySlug(slug);
  if (!item) return {};

  return createPageMetadata({
    title: item.title,
    description: item.description,
    path: `/cases/${item.slug}`,
    keywords: [item.title, ...item.tags, "قاب گوشی", "شاپ قاب"],
  });
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getCaseBySlug(slug);
  if (!item) notFound();

  const path = `/cases/${item.slug}`;
  const schema = webPageJsonLd({
    name: item.title,
    description: item.description,
    path,
  });

  return (
    <main className="min-h-screen bg-[#0c0a09] pt-24 text-white">
      <JsonLd data={schema} />
      <PageShell
        currentPath={path}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-16"
      >
        <div className="mb-8">
          <Link
            href="/cases"
            className="text-sm text-amber-400 transition hover:text-amber-300"
          >
            ← بازگشت به قاب‌های آماده
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-stone-900">
            <Image
              src={item.images[0]}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div>
            <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              {CASE_CATEGORY_LABELS[item.category]}
            </span>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">
              {item.title}
            </h1>
            <p className="mt-4 text-2xl font-bold text-amber-400">
              {formatCasePrice(item.price)}
            </p>
            <p className="mt-6 text-lg leading-8 text-zinc-300">
              {item.description}
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm text-zinc-500">مدل‌های سازگار</p>
              <div className="flex flex-wrap gap-2">
                {item.phoneModels.map((model) => (
                  <span
                    key={model}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="mb-6 text-2xl font-bold">ثبت سفارش این قاب</h2>
              <CaseOrderForm
                designType="predesigned"
                caseSlug={item.slug}
                caseTitle={item.title}
                defaultPhoneModel={item.phoneModels[0]}
                submitLabel="ثبت سفارش قاب"
              />
            </div>
          </div>
        </div>
      </PageShell>
    </main>
  );
}

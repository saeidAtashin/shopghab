import { notFound } from "next/navigation";
import Link from "next/link";

import ModelGrid from "@/app/components/case-wizard/ModelGrid";
import ModelSearch from "@/app/components/case-wizard/ModelSearch";
import SuggestedPhoneCard from "@/app/components/case-wizard/SuggestedPhoneCard";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import { getBrandBySlug, getModelsByBrandAndSeries } from "@/lib/cases/brands.static";
import { getSeriesBySlug } from "@/lib/cases/series";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";

type Props = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ series?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { brand: brandSlug } = await params;
  const { series: seriesSlug } = await searchParams;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return {};

  const series = seriesSlug ? getSeriesBySlug(brandSlug, seriesSlug) : undefined;
  const title = series
    ? `فروش قاب ${series.name} ${brand.name}`
    : `فروش قاب ${brand.name}`;

  return createPageMetadata({
    title,
    description: `انتخاب مدل ${series ? series.name : brand.name} برای فروش قاب موبایل در ${SITE_BRAND} (shopghab).`,
    path: seriesSlug ? `/create/${brandSlug}?series=${seriesSlug}` : `/create/${brandSlug}`,
    keywords: [`فروش قاب ${brand.name}`, "فروش قاب موبایل", SITE_BRAND, "shopghab"],
  });
}

export default async function BrandModelsPage({ params, searchParams }: Props) {
  const { brand: brandSlug } = await params;
  const { series: seriesSlug } = await searchParams;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) notFound();

  if (seriesSlug && !getSeriesBySlug(brandSlug, seriesSlug)) {
    notFound();
  }

  const models = getModelsByBrandAndSeries(brandSlug, seriesSlug);
  const series = seriesSlug ? getSeriesBySlug(brandSlug, seriesSlug) : undefined;

  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background px-4 pt-24 pb-16 text-foreground outline-none sm:px-6">
      <div className="mx-auto max-w-[90rem]">
        <WizardBreadcrumb
          crumbs={[
            { label: "برند", href: "/create" },
            { label: brand.name, href: `/create/${brandSlug}` },
            ...(series ? [{ label: series.name }] : []),
          ]}
        />
        <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">
          {series
            ? `مدل ${series.name} خود را انتخاب کنید`
            : `مدل ${brand.name} خود را انتخاب کنید`}
        </h1>
        <p className="mt-2 text-muted">مرحله ۲ از ۲ — مدل</p>
        <SuggestedPhoneCard className="mt-6" />

        {series ? (
          <Link
            href={`/create/${brandSlug}`}
            className="mt-3 inline-block text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            ← نمایش همه مدل‌های {brand.name}
          </Link>
        ) : null}
        <div className="mt-6">
          <ModelSearch
            brandSlug={brandSlug}
            placeholder={`جستجو در مدل‌های ${brand.name}…`}
          />
        </div>
        <div className="mt-8">
          <ModelGrid brandSlug={brandSlug} models={models} seriesSlug={seriesSlug} />
        </div>
      </div>
    </main>
  );
}

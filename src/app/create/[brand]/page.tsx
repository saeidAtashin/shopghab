import { notFound } from "next/navigation";

import ModelGrid from "@/app/components/case-wizard/ModelGrid";
import ModelSearch from "@/app/components/case-wizard/ModelSearch";
import SeriesChips from "@/app/components/case-wizard/SeriesChips";
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

export async function generateMetadata({ params }: Props) {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return {};

  return createPageMetadata({
    title: `انتخاب مدل ${brand.name}`,
    description: `مدل گوشی ${brand.name} را برای طراحی قاب اختصاصی در ${SITE_BRAND} انتخاب کنید.`,
    path: `/phones/${brandSlug}`,
    noIndex: true,
    keywords: [`قاب اختصاصی ${brand.name}`, "طراحی قاب", SITE_BRAND, "shopghab"],
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

        <div className="sticky top-14 z-30 -mx-4 mt-4 space-y-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 xl:top-[4.5rem]">
          <ModelSearch
            brandSlug={brandSlug}
            placeholder={`جستجو در مدل‌های ${brand.name}…`}
          />
          <SeriesChips
            brandSlug={brandSlug}
            activeSlug={seriesSlug}
            pathname={`/create/${brandSlug}`}
          />
        </div>
        <div id="models" className="mt-6 scroll-mt-36">
          <ModelGrid brandSlug={brandSlug} models={models} seriesSlug={seriesSlug} />
        </div>
      </div>
    </main>
  );
}

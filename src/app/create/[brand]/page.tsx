import { notFound } from "next/navigation";
import Link from "next/link";

import DesignSamplesSection from "@/app/components/designs/DesignSamplesSection";
import ModelGrid from "@/app/components/case-wizard/ModelGrid";
import ModelSearch from "@/app/components/case-wizard/ModelSearch";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import { getBrandBySlug, getModelsByBrandAndSeries } from "@/lib/cases/brands.static";
import { getFeaturedTemplates } from "@/lib/cases/templates.static";
import { getSeriesBySlug } from "@/lib/cases/series";
import { createPageMetadata } from "@/lib/seo/metadata";

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
    ? `انتخاب مدل ${series.name} — ${brand.name}`
    : `انتخاب مدل ${brand.name}`;

  return createPageMetadata({
    title,
    path: seriesSlug ? `/create/${brandSlug}?series=${seriesSlug}` : `/create/${brandSlug}`,
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
  const featuredTemplates = getFeaturedTemplates(4);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
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
        <p className="mt-2 text-muted">مرحله ۲ از ۳ — مدل</p>

        <section className="mt-8 rounded-2xl border border-border bg-card/40 p-5">
          <DesignSamplesSection
            templates={featuredTemplates}
            limit={4}
            title="طراحی آماده برای این برند"
            description="مدل را در مرحله بعد تأیید می‌کنید"
            showViewAll
            initialBrandSlug={brandSlug}
          />
        </section>
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
    </div>
  );
}

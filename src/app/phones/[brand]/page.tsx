import { notFound } from "next/navigation";
import JsonLd from "@/app/components/seo/JsonLd";
import ModelGrid from "@/app/components/case-wizard/ModelGrid";
import SeriesChips from "@/app/components/case-wizard/SeriesChips";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import {
  getBrandBySlug,
  getModelsByBrandAndSeries,
  PHONE_BRANDS,
} from "@/lib/cases/brands.static";
import { getSeriesBySlug } from "@/lib/cases/series";

type Props = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ series?: string }>;
};

export async function generateStaticParams() {
  return PHONE_BRANDS.filter((b) => b.slug !== "other").map((b) => ({
    brand: b.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return {};

  const path = `/phones/${brandSlug}`;
  const title = `خرید قاب گوشی ${brand.name}`;
  const description = `خرید قاب گوشی ${brand.name} در ${SITE_BRAND}. قاب موبایل، قاب اختصاصی و قاب تلفن همراه ${brand.name} با انتخاب مدل، چاپ با کیفیت و ارسال سریع.`;

  return createPageMetadata({
    title,
    description,
    path,
    keywords: [
      `خرید قاب گوشی ${brand.name}`,
      `قاب موبایل ${brand.name}`,
      `قاب اختصاصی ${brand.name}`,
      `قاب تلفن همراه ${brand.name}`,
      `قاب ${brand.nameEn}`,
      "خرید قاب موبایل",
      "shopghab",
      SITE_BRAND,
    ],
  });
}

export default async function BrandPhonesPage({ params, searchParams }: Props) {
  const { brand: brandSlug } = await params;
  const { series: seriesSlug } = await searchParams;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) notFound();
  if (seriesSlug && !getSeriesBySlug(brandSlug, seriesSlug)) notFound();

  const models = getModelsByBrandAndSeries(brandSlug, seriesSlug);
  const path = `/phones/${brandSlug}`;
  const title = `خرید قاب گوشی ${brand.name}`;
  const description = `خرید قاب گوشی ${brand.name} در ${SITE_BRAND}. قاب موبایل، قاب اختصاصی و قاب تلفن همراه با انتخاب مدل.`;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path }),
          collectionPageJsonLd({ name: title, description, path }),
        ]}
      />
      <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 pb-16 px-4 text-foreground outline-none sm:px-6">
        <div className="mx-auto max-w-[90rem]">
          <WizardBreadcrumb
            crumbs={[
              { label: "برند", href: "/create" },
              { label: brand.name },
            ]}
          />
          <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">
            خرید قاب گوشی {brand.name}
          </h1>
          <p className="mt-2 max-w-2xl leading-8 text-muted">
            قاب موبایل، قاب اختصاصی و قاب تلفن همراه {brand.name}. مدل گوشی را انتخاب کنید.
          </p>

          <div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 xl:top-[4.5rem]">
            <SeriesChips
              brandSlug={brandSlug}
              activeSlug={seriesSlug}
              pathname={`/phones/${brandSlug}`}
            />
          </div>
          <div className="mt-6">
            <ModelGrid
              brandSlug={brandSlug}
              models={models}
              seriesSlug={seriesSlug}
              destination="hub"
            />
          </div>
        </div>
      </main>
    </>
  );
}

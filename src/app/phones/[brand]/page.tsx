import Link from "next/link";
import { notFound } from "next/navigation";

import ModelGrid from "@/app/components/case-wizard/ModelGrid";
import SeriesChips from "@/app/components/case-wizard/SeriesChips";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import JsonLd from "@/app/components/seo/JsonLd";
import {
  getBrandBySlug,
  getModelsByBrandAndSeries,
  PHONE_BRANDS,
} from "@/lib/cases/brands.static";
import { getSeriesBySlug } from "@/lib/cases/series";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";

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
  const description = `خرید قاب گوشی ${brand.name} در ${SITE_BRAND}. مدل را انتخاب کنید؛ قاب اختصاصی بسازید یا از طرح‌های آماده استفاده کنید. چاپ باکیفیت و ارسال به سراسر ایران.`;

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
  const description = `خرید قاب گوشی ${brand.name} در ${SITE_BRAND}. قاب موبایل، قاب اختصاصی و طرح آماده با انتخاب مدل.`;

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
              { label: "قاب موبایل", href: "/phones/apple" },
              { label: brand.name },
            ]}
          />
          <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">
            خرید قاب گوشی {brand.name}
          </h1>
          <p className="mt-2 max-w-3xl leading-8 text-muted">
            مدل {brand.name} خود را انتخاب کنید تا قاب اختصاصی بسازید یا طرح آماده را روی همان مدل
            اعمال کنید. چاپ باکیفیت و ارسال سراسری از {SITE_BRAND}.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
            <Link href="/create" className="text-cyan-600 hover:underline dark:text-cyan-400">
              شروع طراحی اختصاصی
            </Link>
            <Link href="/designs" className="text-cyan-600 hover:underline dark:text-cyan-400">
              مشاهده طرح‌های آماده
            </Link>
            <Link href="/designs/category/abstract-minimal" className="text-cyan-600 hover:underline dark:text-cyan-400">
              قاب مینیمال
            </Link>
            <Link href="/designs/category/iranian-art" className="text-cyan-600 hover:underline dark:text-cyan-400">
              هنر ایرانی
            </Link>
          </p>

          <div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 xl:top-[4.5rem]">
            <SeriesChips
              brandSlug={brandSlug}
              activeSlug={seriesSlug}
              pathname={`/phones/${brandSlug}`}
            />
          </div>
          <div id="models" className="mt-6 scroll-mt-36">
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

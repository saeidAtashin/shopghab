import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/app/components/seo/JsonLd";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import {
  getBrandBySlug,
  getModelsByBrand,
  PHONE_BRANDS,
} from "@/lib/cases/brands.static";
import { groupModelsBySeries } from "@/lib/cases/series";

type Props = { params: Promise<{ brand: string }> };

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
  const title = `قاب ${brand.name} — همه مدل‌ها`;
  const description = `خرید و طراحی قاب ${brand.name} — انتخاب مدل گوشی، قاب آماده یا طراحی اختصاصی با چاپ با کیفیت و ارسال سریع.`;

  return createPageMetadata({
    title,
    description,
    path,
    keywords: [
      `قاب ${brand.name}`,
      `قاب ${brand.nameEn}`,
      "قاب موبایل",
      "طراحی قاب",
    ],
  });
}

export default async function BrandPhonesPage({ params }: Props) {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const models = getModelsByBrand(brandSlug);
  const groups = groupModelsBySeries(models, brandSlug);
  const path = `/phones/${brandSlug}`;
  const title = `قاب ${brand.name} — همه مدل‌ها`;
  const description = `خرید و طراحی قاب ${brand.name} — انتخاب مدل گوشی، قاب آماده یا طراحی اختصاصی.`;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path }),
          collectionPageJsonLd({ name: title, description, path }),
        ]}
      />
      <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <WizardBreadcrumb
            crumbs={[
              { label: "برند", href: "/create" },
              { label: brand.name },
            ]}
          />
          <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">
            قاب {brand.name}
          </h1>
          <p className="mt-2 text-muted">
            مدل گوشی خود را انتخاب کنید — قاب آماده یا طراحی اختصاصی
          </p>

          <div className="mt-10 space-y-12">
            {groups.map(({ series, models: groupModels }) => (
              <section key={series.slug}>
                <h2 className="mb-6 border-b border-border pb-3 text-lg font-bold text-foreground">
                  {series.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {groupModels.map((model) => (
                    <Link
                      key={model.slug}
                      href={`/phones/${brandSlug}/${model.slug}`}
                      className="group rounded-2xl border border-border bg-card/60 p-4 transition hover:border-cyan-500/50 hover:bg-card"
                    >
                      <div className="relative mx-auto flex h-36 w-20 items-center justify-center">
                        <PhoneBackSvg
                          model={model}
                          className="h-full w-auto max-w-full drop-shadow-lg transition group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-bold text-foreground">
                          {model.name}
                        </p>
                        <p className="text-xs text-muted">{model.nameEn}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

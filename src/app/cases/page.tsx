import { createPageMetadata } from "@/lib/seo/metadata";
import JsonLd from "@/app/components/seo/JsonLd";
import ReadyCaseCard from "@/app/components/cases/ReadyCaseCard";
import { getReadyCases } from "@/lib/cases/ready.static";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { SITE_BRAND } from "@/lib/seo/site";

const TITLE = "فروش قاب آماده";
const DESCRIPTION = `فروش قاب موبایل آماده در ${SITE_BRAND} (shopghab) — طرح‌های چاپ‌شده، آماده سفارش و ارسال.`;

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/cases",
});

export default function CasesCatalogPage() {
  const products = getReadyCases();

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: TITLE, description: DESCRIPTION, path: "/cases" }),
          collectionPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/cases",
          }),
        ]}
      />
      <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 pb-16 px-4 text-foreground outline-none sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">فروش قاب آماده</h1>
          <p className="mt-2 text-muted">طرح‌های چاپ‌شده شاپ قاب — آماده سفارش و ارسال</p>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {products.map((product) => (
              <ReadyCaseCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

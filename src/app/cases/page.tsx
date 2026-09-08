import { createPageMetadata } from "@/lib/seo/metadata";
import JsonLd from "@/app/components/seo/JsonLd";
import ReadyCaseCard from "@/app/components/cases/ReadyCaseCard";
import { getReadyCases } from "@/lib/cases/ready.static";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";

const TITLE = "قاب‌های آماده";
const DESCRIPTION = "مجموعه قاب‌های طراحی‌شده آماده خرید";

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
      <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">قاب‌های آماده</h1>
          <p className="mt-2 text-muted">طراحی‌های از پیش ساخته‌شده — آماده ارسال</p>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {products.map((product) => (
              <ReadyCaseCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

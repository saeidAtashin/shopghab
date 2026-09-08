import { createPageMetadata } from "@/lib/seo/metadata";
import JsonLd from "@/app/components/seo/JsonLd";
import DesignsGalleryClient from "@/app/components/designs/DesignsGalleryClient";
import { getDesignedTemplates } from "@/lib/cases/templates.static";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";

const TITLE = "طراحی‌های آماده";
const DESCRIPTION =
  "مجموعه طراحی‌های از پیش ساخته‌شده برای قاب موبایل — روی هر مدل گوشی قابل استفاده";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/designs",
});

export default function DesignsGalleryPage() {
  const templates = getDesignedTemplates();

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: TITLE, description: DESCRIPTION, path: "/designs" }),
          collectionPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/designs",
          }),
        ]}
      />
      <div className="min-h-screen bg-background px-4 pb-16 pt-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">{TITLE}</h1>
          <p className="mt-2 max-w-2xl text-muted">
            یک طراحی انتخاب کنید، برند و مدل گوشی‌تان را مشخص کنید و در ادیتور ویرایش
            کنید.
          </p>
          <div className="mt-8">
            <DesignsGalleryClient templates={templates} />
          </div>
        </div>
      </div>
    </>
  );
}

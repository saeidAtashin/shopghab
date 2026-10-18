import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "../../lib/seo/metadata";
import { webPageJsonLd } from "../../lib/seo/jsonld";

const PATH = "/tracking";
const TITLE = "پیگیری سفارش";
const DESCRIPTION =
  "با کد سفارش، وضعیت چاپ و ارسال قاب موبایل را در شاپ قاب ببینید.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["پیگیری سفارش قاب", "کد سفارش شاپ قاب", "فروش قاب موبایل"],
});

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell
      currentPath={PATH}
      jsonLd={webPageJsonLd({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
      })}
      className="min-h-screen bg-background text-foreground"
      containerClassName="container mx-auto max-w-3xl px-6"
      breadcrumbClassName="mb-6 pt-24"
    >
      {children}
    </PageShell>
  );
}

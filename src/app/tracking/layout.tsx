import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "../../lib/seo/metadata";
import { webPageJsonLd } from "../../lib/seo/jsonld";

const PATH = "/tracking";
const TITLE = "پیگیری وضعیت تعمیر";
const DESCRIPTION =
  "با کد پیگیری، وضعیت لحظه‌ای تعمیر کنسول خود را مشاهده کنید.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["پیگیری تعمیر کنسول", "کد پیگیری تعمیر"],
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
      className="min-h-screen bg-[#050816] text-white"
      containerClassName="container mx-auto max-w-3xl px-6"
      breadcrumbClassName="mb-6 pt-24"
    >
      {children}
    </PageShell>
  );
}

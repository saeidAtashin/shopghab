import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";

const PATH = "/about-us";
const TITLE = "درباره ما";
const DESCRIPTION =
  "شاپ‌قاب طراحی و چاپ قاب موبایل اختصاصی را با انتخاب برند و مدل، پیش‌نمایش زنده و ارسال به سراسر ایران انجام می‌دهد.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["درباره شاپ‌قاب", "طراحی قاب موبایل", "چاپ قاب"],
});

export default function AboutUsPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 text-foreground outline-none">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-9 text-muted">
          {SITE_BRAND} قاب موبایل اختصاصی می‌سازد: برند و مدل گوشی را انتخاب
          می‌کنید، متن و طرح را روی قاب می‌بینید و سفارش چاپ‌شده را در خانه
          تحویل می‌گیرید.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
          تمرکز ما روی پیش‌نمایش دقیق، چاپ باکیفیت و پیگیری شفاف سفارش است؛ از
          انتخاب طرح آماده تا ارسال به سراسر ایران.
        </p>
      </PageShell>
    </main>
  );
}

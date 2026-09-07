import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import { aboutPageJsonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/app/components/seo/JsonLd";
import Link from "next/link";

const PATH = "/about-us";
const TITLE = "درباره Shopghab | شاپ‌قاب";
const DESCRIPTION =
  "آشنایی با شاپ‌قاب؛ فروشگاه قاب گوشی آماده و طراحی سفارشی با تمرکز روی کیفیت چاپ و تجربه سفارش ساده.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["درباره شاپ قاب", "Shopghab", "قاب گوشی"],
});

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-[#0c0a09] pt-24 text-white">
      <JsonLd
        data={aboutPageJsonLd({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto max-w-4xl px-6 pb-16"
      >
        <h1 className="text-4xl font-black md:text-5xl">درباره شاپ‌قاب</h1>
        <p className="mt-6 text-lg leading-8 text-zinc-300">
          شاپ‌قاب (Shopghab) روی فروش قاب گوشی آماده و طراحی سفارشی تمرکز دارد.
          هدف ما این است که انتخاب مدل، ثبت سفارش و دریافت قاب باکیفیت ساده و
          شفاف باشد.
        </p>

        <div className="mt-10 space-y-6 text-zinc-300 leading-8">
          <p>
            از طرح‌های مینیمال و هنری گرفته تا چاپ تصویر اختصاصی شما، تیم شاپ‌قاب
            روی کیفیت چاپ، سازگاری با مدل گوشی و پشتیبانی سفارش کار می‌کند.
          </p>
          <p>
            می‌توانید از کاتالوگ قاب‌های آماده انتخاب کنید یا مسیر طراحی سفارشی
            را برای ساخت قاب شخصی خودتان طی کنید.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/cases"
            className="rounded-2xl bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400"
          >
            مشاهده قاب‌ها
          </Link>
          <Link
            href="/custom"
            className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:border-amber-400/40"
          >
            طراحی سفارشی
          </Link>
        </div>
      </PageShell>
    </main>
  );
}

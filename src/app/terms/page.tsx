import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/terms";
const TITLE = "قوانین و شرایط";
const DESCRIPTION =
  "شرایط استفاده از فروشگاه شاپ‌قاب، ثبت سفارش قاب آماده و سفارشی، و مسئولیت‌های طرفین.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["قوانین شاپ قاب", "شرایط استفاده", "شرایط سفارش قاب"],
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0c0a09] pt-24 text-white">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-4xl leading-8 text-zinc-300">
          ثبت سفارش در شاپ‌قاب به معنی پذیرش قوانین مربوط به انتخاب مدل گوشی،
          تایید طرح، زمان تقریبی آماده‌سازی، هزینه و شرایط ارسال است. جزئیات هر
          سفارش پیش از نهایی‌شدن با مشتری هماهنگ می‌شود.
        </p>
      </PageShell>
    </main>
  );
}

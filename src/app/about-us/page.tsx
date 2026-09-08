import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/about-us";
const TITLE = "درباره ما";
const DESCRIPTION =
  "آشنایی با کنسول ریپیر، تیم فنی، رویکرد تعمیر تخصصی کنسول و تعهد ما به کیفیت خدمات.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["درباره ما", "کنسول ریپیر", "تیم تعمیرات کنسول"],
});

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-9 text-muted">
          کنسول ریپیر با تمرکز بر عیب یابی دقیق، استفاده از قطعات باکیفیت و تحویل
          سریع، خدمات تعمیر PS5، PS4، Xbox و دسته بازی را ارائه می دهد.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
          هدف ما این است که تجربه ای شفاف و قابل اعتماد برای مشتریان ایجاد کنیم؛
          از ثبت سفارش و اعلام هزینه تقریبی تا پیگیری وضعیت تعمیر.
        </p>
      </PageShell>
    </main>
  );
}

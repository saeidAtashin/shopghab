import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/terms";
const TITLE = "قوانین و شرایط";
const DESCRIPTION =
  "شرایط استفاده از خدمات کنسول ریپیر، مسئولیت ها، روند پذیرش سفارش و قوانین مرتبط با تعمیر.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["قوانین خدمات", "شرایط استفاده", "شرایط تعمیر کنسول"],
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black pt-24 text-white">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <p className="mt-6 max-w-4xl leading-8 text-zinc-300">
          ثبت سفارش در کنسول ریپیر به معنی پذیرش قوانین مربوط به روند عیب یابی،
          اعلام هزینه، مدت زمان تقریبی تعمیر و شرایط تحویل دستگاه است. جزئیات
          دقیق هر سفارش پیش از شروع تعمیر با مشتری هماهنگ می شود.
        </p>
      </PageShell>
    </main>
  );
}

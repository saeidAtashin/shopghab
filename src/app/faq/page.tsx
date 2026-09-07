import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/faq";
const TITLE = "سوالات متداول";
const DESCRIPTION =
  "پاسخ به سوالات رایج درباره سفارش قاب آماده، طراحی سفارشی، زمان آماده‌سازی و پیگیری.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["سوالات متداول", "FAQ قاب گوشی", "سفارش شاپ قاب"],
});

const faqItems = [
  {
    question: "تفاوت قاب آماده و سفارشی چیست؟",
    answer:
      "قاب آماده از طرح‌های موجود کاتالوگ انتخاب می‌شود. در سفارش سفارشی، طرح یا تصویر خودتان را ارسال می‌کنید تا روی قاب چاپ شود.",
  },
  {
    question: "زمان آماده‌سازی سفارش چقدر است؟",
    answer:
      "سفارش‌های آماده معمولاً سریع‌تر پردازش می‌شوند. سفارش‌های سفارشی بسته به طرح و صف چاپ زمان بیشتری می‌گیرند و پس از ثبت اعلام می‌شود.",
  },
  {
    question: "چطور وضعیت سفارش را پیگیری کنم؟",
    answer:
      "پس از ثبت سفارش یک کد رهگیری دریافت می‌کنید. از صفحه پیگیری سفارش می‌توانید آخرین وضعیت را ببینید.",
  },
  {
    question: "کدام مدل‌های گوشی پشتیبانی می‌شوند؟",
    answer:
      "مدل‌های محبوب آیفون، سامسونگ و شیائومی در فرم سفارش قابل انتخاب هستند. اگر مدل شما نیست، در توضیحات یا واتساپ بپرسید.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#0c0a09] pt-24 text-white">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
      >
        <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
        <div className="mt-8 space-y-4">
          {faqItems.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6"
            >
              <h2 className="text-lg font-bold text-white">{item.question}</h2>
              <p className="mt-3 leading-8 text-zinc-300">{item.answer}</p>
            </article>
          ))}
        </div>
      </PageShell>
    </main>
  );
}

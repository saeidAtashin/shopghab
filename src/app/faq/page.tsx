import PageShell from "@/app/components/seo/PageShell";
import JsonLd from "@/app/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd } from "@/lib/seo/jsonld";

const PATH = "/faq";
const TITLE = "سوالات متداول";
const DESCRIPTION =
  "پاسخ به سوالات رایج درباره طراحی قاب، زمان چاپ، ارسال، مرجوعی و پیگیری سفارش شاپ‌قاب.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["سوالات متداول قاب", "زمان چاپ قاب", "ارسال قاب موبایل"],
});

const faqItems = [
  {
    question: "چطور قاب اختصاصی طراحی کنم؟",
    answer:
      "برند و مدل گوشی را انتخاب کنید، متن یا طرح را در پیش‌نمایش اضافه کنید و سفارش را ثبت کنید. می‌توانید از طرح‌های آماده هم شروع کنید و بعد آن را ویرایش کنید.",
  },
  {
    question: "چاپ قاب چقدر طول می‌کشد؟",
    answer:
      "پس از تأیید طرح، چاپ معمولاً یک تا سه روز کاری زمان می‌برد. زمان دقیق آماده شدن در صفحه پیگیری سفارش به‌روز می‌شود.",
  },
  {
    question: "ارسال به کدام شهرها انجام می‌شود؟",
    answer:
      "سفارش‌ها به سراسر ایران ارسال می‌شود. هزینه و بازه تحویل هنگام تسویه حساب مشخص می‌شود.",
  },
  {
    question: "اگر قاب مطابق انتظار نباشد چه می‌شود؟",
    answer:
      "تا ۷ روز پس از تحویل می‌توانید درخواست بازگشت ثبت کنید. شرایط مرجوعی در صفحه قوانین و شرایط آمده است.",
  },
  {
    question: "چطور وضعیت سفارش را پیگیری کنم؟",
    answer:
      "از صفحه پیگیری سفارش و با کد سفارش، مرحله چاپ و ارسال قاب را ببینید.",
  },
];

export default function FaqPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 text-foreground outline-none">
      <JsonLd data={faqPageJsonLd(faqItems)} />
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
              className="rounded-2xl border border-border bg-card/40 p-6"
            >
              <h2 className="text-lg font-bold text-foreground">{item.question}</h2>
              <p className="mt-3 leading-8 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </PageShell>
    </main>
  );
}

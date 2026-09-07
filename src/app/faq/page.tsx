import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";

const PATH = "/faq";
const TITLE = "سوالات متداول";
const DESCRIPTION =
  "پاسخ به سوالات رایج درباره زمان تعمیر، هزینه تقریبی، گارانتی خدمات و روند ثبت سفارش.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["سوالات متداول", "FAQ تعمیر کنسول", "گارانتی تعمیرات"],
});

const faqItems = [
  {
    question: "زمان تقریبی تعمیر چقدر است؟",
    answer:
      "بسته به نوع خرابی، زمان تعمیر می تواند از چند ساعت تا چند روز متغیر باشد. زمان دقیق پس از عیب یابی اعلام می شود.",
  },
  {
    question: "آیا خدمات شامل گارانتی است؟",
    answer:
      "بله، خدمات تعمیرات با ضمانت ارائه می شود و شرایط هر خدمت هنگام ثبت سفارش اعلام خواهد شد.",
  },
  {
    question: "چطور وضعیت سفارش را پیگیری کنم؟",
    answer:
      "از طریق صفحه پیگیری تعمیر و کد سفارش می توانید آخرین وضعیت دستگاه خود را مشاهده کنید.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-black pt-24 text-white">
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

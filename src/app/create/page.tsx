import Link from "next/link";

import BrandGrid from "@/app/components/case-wizard/BrandGrid";
import ModelSearch from "@/app/components/case-wizard/ModelSearch";
import SuggestedPhoneCard from "@/app/components/case-wizard/SuggestedPhoneCard";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import JsonLd from "@/app/components/seo/JsonLd";
import { PHONE_BRANDS } from "@/lib/cases/brands.static";
import { faqPageJsonLd, howToJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";

const TITLE = "طراحی و خرید قاب اختصاصی";
const DESCRIPTION = `طراحی قاب اختصاصی در ${SITE_BRAND}. برند و مدل گوشی را انتخاب کنید، متن یا تصویر اضافه کنید و قاب موبایل شخصی خود را با چاپ باکیفیت سفارش دهید.`;
const PATH = "/create";

const FAQ = [
  {
    question: "قاب اختصاصی چطور سفارش داده می‌شود؟",
    answer: `برند و مدل گوشی را انتخاب کنید، وارد ادیتور شوید، تصویر یا متن اضافه کنید و پس از پیش‌نمایش، سفارش چاپ را در ${SITE_BRAND} ثبت کنید.`,
  },
  {
    question: "اگر طرح آماده بخواهم چه کنم؟",
    answer: "از گالری طرح‌های آماده دیدن کنید، طرح را انتخاب کنید و روی مدل گوشی خود اعمال کنید.",
  },
  {
    question: "روی کدام گوشی‌ها چاپ می‌شود؟",
    answer: "آیفون، سامسونگ، شیائومی، هواوی و مدل‌های متداول اندروید پشتیبانی می‌شوند.",
  },
];

const STEPS = [
  "برند گوشی را انتخاب کنید.",
  "مدل دقیق گوشی را مشخص کنید.",
  "تصویر، متن یا استیکر را در ادیتور اضافه کنید.",
  "پیش‌نمایش را تأیید و سفارش چاپ را ثبت کنید.",
];

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "طراحی قاب اختصاصی",
    "خرید قاب اختصاصی",
    "قاب سفارشی",
    "چاپ روی قاب",
    "خرید قاب موبایل",
    SITE_BRAND,
    "shopghab",
  ],
});

export default function CreatePage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 pb-16 px-4 text-foreground outline-none sm:px-6">
      <JsonLd
        data={[
          webPageJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH }),
          howToJsonLd({
            name: "مراحل طراحی قاب اختصاصی",
            description: DESCRIPTION,
            path: PATH,
            steps: STEPS,
          }),
          faqPageJsonLd(FAQ),
        ]}
      />
      <div className="mx-auto max-w-[90rem]">
        <WizardBreadcrumb crumbs={[{ label: "برند" }]} />
        <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">{TITLE}</h1>
        <p className="mt-2 max-w-3xl leading-8 text-muted">
          قاب منحصربه‌فرد خود را بسازید: برند و مدل را انتخاب کنید، طرح را در ادیتور کامل کنید و چاپ
          باکیفیت را به سراسر ایران سفارش دهید. اگر هنوز ایده ندارید،{" "}
          <Link href="/designs" className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
            طرح‌های آماده
          </Link>{" "}
          را ببینید.
        </p>
        <p className="mt-1 text-sm text-muted">مرحله ۱ از ۲ — برند</p>
        <SuggestedPhoneCard className="mt-6" />

        <div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 xl:top-[4.5rem]">
          <ModelSearch placeholder="مثلاً گلکسی S24، آیفون 15 Pro، ردمی نوت 13…" />
        </div>
        <div className="mt-6">
          <BrandGrid brands={PHONE_BRANDS} />
        </div>

        <section className="mt-12 max-w-3xl" aria-labelledby="create-faq-heading">
          <h2 id="create-faq-heading" className="text-xl font-black text-foreground">
            سوالات طراحی قاب اختصاصی
          </h2>
          <div className="mt-4 space-y-4">
            {FAQ.map((item) => (
              <article key={item.question} className="rounded-2xl border border-border bg-card/60 p-4">
                <h3 className="font-bold text-foreground">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

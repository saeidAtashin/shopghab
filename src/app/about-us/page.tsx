import Link from "next/link";
import PageShell from "@/app/components/seo/PageShell";
import WhyUs from "@/app/components/sections/WhyUs";
import { createPageMetadata } from "@/lib/seo/metadata";
import { aboutPageJsonLd } from "@/lib/seo/jsonld";
import { SITE_TAGLINE } from "@/lib/seo/site";
import { ArrowLeft, Search, ClipboardList, Wrench, ShieldCheck } from "lucide-react";

const PATH = "/about-us";
const TITLE = "درباره FixBazi | فیکس‌بازی";
const DESCRIPTION =
  "آشنایی با FixBazi (فیکس‌بازی)، تیم فنی، رویکرد تعمیر تخصصی PS5 و Xbox و تعهد ما به کیفیت و شفافیت.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "درباره FixBazi",
    "فیکس‌بازی",
    "تیم تعمیرات کنسول",
    "تعمیر PS5",
    "تعمیر Xbox",
  ],
});

const ABOUT_SCHEMA = aboutPageJsonLd({
  name: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

const processSteps = [
  {
    title: "عیب‌یابی دقیق",
    description: "بررسی تخصصی دستگاه و تشخیص ریشه مشکل قبل از هر اقدامی.",
    icon: Search,
  },
  {
    title: "اعلام هزینه",
    description: "برآورد شفاف هزینه تعمیر — بدون هزینه پنهان یا غافلگیری.",
    icon: ClipboardList,
  },
  {
    title: "تعمیر تخصصی",
    description: "انجام تعمیر با ابزار حرفه‌ای و قطعات اورجینال.",
    icon: Wrench,
  },
  {
    title: "گارانتی خدمات",
    description: "تحویل دستگاه همراه با ضمانت و امکان پیگیری آنلاین.",
    icon: ShieldCheck,
  },
];

const stats = [
  { label: "گارانتی", value: "۹۰ روز" },
  { label: "زمان تحویل", value: "< ۲۴ ساعت" },
  { label: "قطعات", value: "اورجینال" },
  { label: "پیگیری", value: "آنلاین" },
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-black pt-24 text-white">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
        jsonLd={ABOUT_SCHEMA}
      >
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black md:text-5xl">درباره FixBazi</h1>
          <p className="mt-4 text-lg text-cyan-400">{SITE_TAGLINE}</p>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-zinc-300">
            فیکس‌بازی مرکز تخصصی تعمیر PS5، PS4، Xbox و دسته بازی در
            تهران است. ما با تمرکز بر عیب‌یابی دقیق، استفاده از قطعات باکیفیت و
            تحویل سریع، خدماتی شفاف و قابل اعتماد ارائه می‌دهیم.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400">
            هدف FixBazi ایجاد تجربه‌ای روشن برای مشتریان است؛ از ثبت سفارش
            آنلاین و اعلام هزینه تقریبی تا پیگیری لحظه‌ای وضعیت تعمیر. چه
            مشکل HDMI داشته باشید، چه آنالوگ دسته خراب شده باشد — تیم ما آماده
            کمک است.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 text-center"
            >
              <p className="text-3xl font-black text-cyan-400">{stat.value}</p>
              <p className="mt-2 text-sm text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="mb-10 text-center text-3xl font-black">
            فرآیند تعمیر در FixBazi
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6"
              >
                <span className="absolute left-4 top-4 text-4xl font-black text-white/5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <step.icon size={24} />
                </div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <WhyUs />

        <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/repair"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
          >
            ثبت سفارش تعمیر
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400/50"
          >
            تماس با ما
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 px-6 py-3 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/10"
          >
            سوالات متداول
            <ArrowLeft size={16} />
          </Link>
        </div>
      </PageShell>
    </main>
  );
}

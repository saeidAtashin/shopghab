import Link from "next/link";

import FadeUp from "@/app/components/animations/FadeUp";

const items = [
  {
    title: "طرح‌های آماده",
    description: "فروش قاب موبایل با طرح‌های آماده برای چاپ.",
    href: "/designs",
  },
  {
    title: "طراحی اختصاصی",
    description: "قاب گوشی را در شاپ قاب خودتان طراحی کنید.",
    href: "/create",
  },
  {
    title: "قاب آماده",
    description: "قاب‌های چاپ‌شده، آماده سفارش و ارسال.",
    href: "/cases",
  },
];

export default function Services() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="container mx-auto px-6">
        <FadeUp>
          <div className="mb-20 text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-400 backdrop-blur-xl">
              شاپ قاب
            </span>

            <h2 className="mb-6 text-4xl font-black text-foreground md:text-6xl">
              فروش قاب موبایل در شاپ قاب
            </h2>

            <p className="mx-auto max-w-2xl text-base leading-8 text-muted md:text-lg">
              طراحی و چاپ قاب گوشی برای آیفون، سامسونگ و شیائومی با پیش‌نمایش
              و ارسال به سراسر ایران
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <FadeUp key={item.href} delay={index * 0.08}>
              <Link
                href={item.href}
                className="block h-full rounded-3xl border border-border bg-surface p-8 transition hover:border-cyan-500/40"
              >
                <h3 className="text-xl font-black text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

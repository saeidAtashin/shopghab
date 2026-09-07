"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Palette, ShieldCheck, Smartphone, Sparkles, Truck } from "lucide-react";

import ContactCTA from "./sections/ContactCTA";
import WhyUs from "./sections/WhyUs";
import SiteBackground from "./ui/SiteBackground";
import {
  formatCasePrice,
  getFeaturedCases,
} from "@/lib/case-catalog";

export default function HomePage() {
  const featured = getFeaturedCases().slice(0, 4);

  return (
    <main className="relative bg-[#0c0a09] pt-20 text-white">
      <SiteBackground />

      <section className="relative isolate overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,119,6,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(12,10,9,0.9))]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-[1500px] flex-col justify-center px-4 py-16 sm:px-6 xl:px-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium tracking-wide text-amber-400"
          >
            Shopghab · شاپ‌قاب
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6 }}
            className="mt-4 max-w-4xl font-black leading-[1.08] text-[clamp(2.8rem,6vw,5.2rem)]"
          >
            شاپ‌قاب
            <span className="mt-2 block text-stone-200">
              قاب آماده و طرح سفارشی
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-stone-400 sm:text-xl"
          >
            قاب گوشی با چاپ باکیفیت برای آیفون، سامسونگ و شیائومی — از طرح‌های
            آماده تا طراحی کاملاً شخصی.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.6 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/cases"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 px-8 py-4 text-lg font-bold text-black transition hover:from-amber-400 hover:to-orange-400"
            >
              مشاهده قاب‌ها
            </Link>
            <Link
              href="/custom"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:border-amber-400/40 hover:bg-white/10"
            >
              طراحی سفارشی
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="pointer-events-none absolute inset-y-10 left-4 hidden w-[42%] lg:block xl:left-10"
            aria-hidden
          >
            <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-stone-900/60">
              <Image
                src="/images/ps5-repair.webp"
                alt=""
                fill
                className="object-cover opacity-80"
                sizes="40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-black md:text-4xl">چطور سفارش بدم؟</h2>
            <p className="mt-4 text-stone-400">
              دو مسیر ساده برای قاب آماده یا طرح اختصاصی خودتان.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/cases"
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-amber-400/40"
            >
              <Smartphone className="h-8 w-8 text-amber-400" />
              <h3 className="mt-5 text-2xl font-bold">قاب آماده</h3>
              <p className="mt-3 leading-8 text-stone-400">
                از میان طرح‌های از پیش طراحی‌شده انتخاب کنید، مدل گوشی را بزنید و
                سفارش دهید.
              </p>
            </Link>
            <Link
              href="/custom"
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-rose-400/40"
            >
              <Palette className="h-8 w-8 text-rose-400" />
              <h3 className="mt-5 text-2xl font-bold">طراحی سفارشی</h3>
              <p className="mt-3 leading-8 text-stone-400">
                ایده یا فایل طرح را بفرستید تا قاب اختصاصی شما چاپ و آماده ارسال
                شود.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-amber-400">منتخب شاپ‌قاب</p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                قاب‌های پرطرفدار
              </h2>
            </div>
            <Link
              href="/cases"
              className="text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              مشاهده همه ←
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <Link
                key={item.slug}
                href={`/cases/${item.slug}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-amber-400/35"
              >
                <div className="relative aspect-[4/5] bg-stone-900">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-amber-400">
                    {formatCasePrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="container mx-auto grid gap-6 px-6 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "چاپ باکیفیت",
              text: "رنگ پایدار و جزئیات دقیق روی قاب.",
            },
            {
              icon: ShieldCheck,
              title: "محافظت واقعی",
              text: "لبه‌های مقاوم برای ضربه و خط‌وخش روزمره.",
            },
            {
              icon: Truck,
              title: "ارسال سریع",
              text: "آماده‌سازی سفارش و ارسال به سراسر کشور.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <item.icon className="h-7 w-7 text-amber-400" />
              <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-stone-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <WhyUs />
      <ContactCTA />
    </main>
  );
}

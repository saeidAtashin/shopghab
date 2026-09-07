"use client";

import { ShieldCheck, Clock3, Palette, BadgeCheck } from "lucide-react";
import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import FloatingBadge from "../ui/FloatingBadge";

const features = [
  {
    title: "چاپ ماندگار",
    description: "رنگ‌ها و طرح‌ها در برابر محو شدن روزمره مقاوم هستند.",
    icon: <ShieldCheck size={32} />,
    badge: { label: "کیفیت", value: "UV" },
  },
  {
    title: "آماده‌سازی سریع",
    description: "سفارش‌های آماده معمولاً در کوتاه‌ترین زمان پردازش می‌شوند.",
    icon: <Clock3 size={32} />,
    badge: { label: "زمان", value: "سریع" },
  },
  {
    title: "طرح سفارشی",
    description: "از ایده شخصی تا چاپ نهایی، همراه شما هستیم.",
    icon: <Palette size={32} />,
    badge: { label: "سفارشی", value: "۱۰۰٪" },
  },
  {
    title: "سازگاری گسترده",
    description: "پوشش مدل‌های محبوب آیفون، سامسونگ و شیائومی.",
    icon: <BadgeCheck size={32} />,
    badge: { label: "مدل‌ها", value: "گسترده" },
  },
];

export default function WhyUs() {
  const ref = useRef(null);
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { margin: "-80px" });

  return (
    <section ref={ref} className="relative py-32">
      <div className="container mx-auto px-6">
        <div className="mb-20 text-center">
          <span className="mb-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
            چرا شاپ‌قاب؟
          </span>

          <h2 className="mb-6 text-4xl font-black text-white md:text-5xl">
            چرا مشتری‌ها به ما اعتماد می‌کنند؟
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-400">
            تمرکز ما روی کیفیت چاپ، انتخاب مدل درست و تجربه سفارش ساده برای قاب
            گوشی است.
          </p>
        </div>

        <div
          ref={cardRef}
          className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              <FloatingBadge
                label={feature.badge.label}
                value={feature.badge.value}
              />
              <div className="mb-5 text-amber-400">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="mt-3 leading-7 text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

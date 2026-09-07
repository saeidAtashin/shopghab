"use client";

import { ShieldCheck, Clock3, Wrench, BadgeCheck } from "lucide-react";
import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import FloatingBadge from "../ui/FloatingBadge";

const features = [
  {
    title: "ضمانت تعمیر",
    description: "تمام خدمات تعمیر همراه با ضمانت واقعی ارائه می‌شوند.",
    icon: <ShieldCheck size={32} />,
    badge: { label: "گارانتی", value: "۹۰ روز" },
  },
  {
    title: "تعمیر سریع",
    description: "اکثر تعمیرات در کوتاه‌ترین زمان ممکن انجام می‌شود.",
    icon: <Clock3 size={32} />,
    badge: { label: "زمان", value: "< ۲۴ساعت" },
  },
  {
    title: "تجهیزات تخصصی",
    description: "عیب‌یابی و تعمیر با ابزارهای حرفه‌ای و دقیق انجام می‌شود.",
    icon: <Wrench size={32} />,
    badge: { label: "تجهیزات", value: "پیشرفته" },
  },
  {
    title: "قطعات اصلی",
    description: "استفاده از قطعات اورجینال برای افزایش عمر دستگاه.",
    icon: <BadgeCheck size={32} />,
    badge: { label: "کیفیت", value: "اورجینال" },
  },
];

export default function WhyUs() {
  const ref = useRef(null);
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { margin: "-80px" });

  return (
    <section ref={ref} className="relative py-32">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-32 text-center">
          <span className="mb-4 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
            چرا ما؟
          </span>

          <h2 className="mb-6 text-5xl font-black text-white">
            چرا مشتری‌ها به ما اعتماد می‌کنند؟
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-400">
            تجربه، تجهیزات تخصصی و پشتیبانی حرفه‌ای باعث شده صدها گیمر تعمیر
            کنسول خود را به ما بسپارند.
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 mt-10">
          {features.map((feature, index) => {
            const isBottomRow = index === 0 || index === 3;

            return (
              <div key={feature.title} ref={cardRef} className="relative">
                {/* Floating badge */}
                <motion.div
                  initial={{ y: isBottomRow ? -40 : 40, opacity: 0 }}
                  animate={
                    inView
                      ? { y: isBottomRow ? 60 : -60, opacity: 1 }
                      : { y: isBottomRow ? -40 : 40, opacity: 0 }
                  }
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`
          absolute left-1/2 -translate-x-1/2 z-0
          hidden md:block
          ${isBottomRow ? "-bottom-12 lg:-bottom-10" : "-top-12 lg:-top-10"}
        `}
                >
                  <FloatingBadge
                    label={feature.badge.label}
                    value={feature.badge.value}
                    className="border-cyan-500/30 bg-black/40"
                    valueClassName="text-cyan-400"
                  />
                </motion.div>

                {/* Card */}
                <div className="relative z-10 rounded-3xl border border-zinc-800 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-500/40">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                    {feature.icon}
                  </div>

                  <h3 className="mb-4 text-2xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="leading-7 text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

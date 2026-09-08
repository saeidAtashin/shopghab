"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Gamepad2, Sparkles } from "lucide-react";

import FloatingBadge from "@/app/components/ui/FloatingBadge";

import BlogFloatingOrbs from "./BlogFloatingOrbs";
import "./blog-animations.css";

type Props = {
  postCount: number;
  gameCount: number;
};

export default function BlogIndexHero({ postCount, gameCount }: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="blog-scene relative mb-14 overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-card/80 via-background to-background px-6 py-14 md:px-12 md:py-16">
      <BlogFloatingOrbs />

      <div className="blog-glow-ring absolute start-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
      <div className="blog-glow-ring absolute start-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 opacity-60" />

      <div className="relative z-10">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-3 text-cyan-400"
        >
          <BookOpen className="h-5 w-5" aria-hidden />
          <span className="text-sm font-semibold tracking-wide">بلاگ فیکس‌بازی</span>
        </motion.div>

        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="max-w-3xl text-4xl font-black leading-tight md:text-5xl lg:text-6xl"
        >
          <span className="bg-gradient-to-l from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent animate-gradient-x">
            راهنمای بازی و گیمینگ
          </span>
        </motion.h1>

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-muted"
        >
          بهترین بازی‌های PS5 و Xbox، نکات نصب و راهنمای انتخاب — با داده‌های
          به‌روز و پیشنهاد تخصصی تیم فیکس‌بازی.
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            <Sparkles className="h-4 w-4" aria-hidden />
            {postCount} مقاله تخصصی
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Gamepad2 className="h-4 w-4" aria-hidden />
            {gameCount}+ بازی معرفی‌شده
          </span>
        </motion.div>
      </div>

      <FloatingBadge
        label="پیشنهاد ویژه"
        value="بهترین بازی‌های ۲۰۲۶"
        className="absolute bottom-8 end-8 hidden border-cyan-500/30 bg-cyan-500/10 lg:block"
        valueClassName="text-cyan-300"
        animateY={[-4, -14, -4]}
        duration={5}
      />
      <FloatingBadge
        label="دسته‌بندی"
        value="۴ ژانر محبوب"
        className="absolute top-10 end-10 hidden border-violet-500/25 bg-violet-500/10 xl:block"
        valueClassName="text-violet-300"
        animateY={[0, -12, 0]}
        duration={6}
      />
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import HeroFeatures from "./HeroFeatures";
import HeroCtaButtons from "./HeroCtaButtons";

export default function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 1, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 backdrop-blur-xl"
      >
        <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_#22d3ee]" />
        <span className="text-sm font-medium text-cyan-200/90">
          فیکس بازی — مرکز تخصصی تعمیر PS5 / PS4 / Xbox
        </span>
      </motion.div>

      {/* Heading */}
      <div className="max-w-3xl">
        <motion.h1
          initial={{ opacity: 1, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="font-black sorenanormal leading-[1.05] tracking-tight text-white text-[clamp(2.8rem,5vw,4.5rem)]"
        >
          تعمیر حرفه‌ای
          <span className="mt-2 block text-zinc-200 sorenanormal">
            کنسول و دسته بازی
          </span>
          <span className="mt-3 block sorenanormal bg-[linear-gradient(90deg,#60a5fa,#22d3ee,#a78bfa,#60a5fa)] bg-[length:220%_220%] bg-clip-text text-transparent animate-gradient-x">
            دقیق، سریع، مطمئن
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 1, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 font-mono text-lg tracking-tight text-cyan-400 lowercase sm:text-xl"
        >
          FixBazi ·{" "}
          <span className="font-black text-white sorenanormal normal-case">
            فیکس<span className="text-cyan-500">‌بازی</span>
          </span>
        </motion.p>

        <motion.p
          initial={{ opacity: 1, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl"
        >
          از مشکلات روشن نشدن و خرابی HDMI تا تعمیر آنالوگ و دکمه‌های دسته،
          همه‌چیز با عیب‌یابی تخصصی، قطعات اصلی و ضمانت واقعی انجام می‌شود.
        </motion.p>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 1, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7 }}
      >
        <HeroFeatures />
      </motion.div>

      <motion.div
        initial={{ opacity: 1, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7 }}
      >
        <HeroCtaButtons />
      </motion.div>
    </motion.div>
  );
}

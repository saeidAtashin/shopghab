"use client";

import { motion } from "framer-motion";

type HeroQuickAccessGuideProps = {
  onDismiss: () => void;
};

export default function HeroQuickAccessGuide({
  onDismiss,
}: HeroQuickAccessGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-end justify-center bg-black/50 px-3 pb-3 backdrop-blur-[2px] sm:items-center sm:px-6 sm:pb-0"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-cyan-400/35 bg-[#04142a]/90 p-4 text-center text-sm leading-relaxed text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.2)] sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-medium">شما میتوانید از این بخش کنسول را انتخاب نمایید.</p>
        <p className="mt-2 text-cyan-100/90">
          بعد از این قسمت مشکل خود را انتخاب نمایید.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full min-h-[44px] rounded-xl border border-cyan-400/45 bg-cyan-500/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500/35"
        >
          متوجه شدم
        </button>
      </div>
    </motion.div>
  );
}

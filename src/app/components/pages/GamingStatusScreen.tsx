"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Gamepad2, Hammer, Home, Skull, Wrench } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export type GamingStatusVariant = "not-found" | "construction";

type QuickLink = {
  href: string;
  label: string;
};

type GamingStatusScreenProps = {
  variant: GamingStatusVariant;
  code: string;
  hudLabel: string;
  title: string;
  description: string;
  flavorText: string;
  quickLinks?: QuickLink[];
};

const variantConfig: Record<
  GamingStatusVariant,
  {
    icon: typeof Skull;
    accent: string;
    glow: string;
    barLabel: string;
    barPercent: number;
    lottieSrc: string;
  }
> = {
  "not-found": {
    icon: Skull,
    accent: "text-red-400",
    glow: "from-red-600/30 via-rose-500/10 to-transparent",
    barLabel: "HP",
    barPercent: 0,
    lottieSrc: "/obj-console/404.lottie",
  },
  construction: {
    icon: Hammer,
    accent: "text-amber-300",
    glow: "from-amber-500/25 via-cyan-500/10 to-transparent",
    barLabel: "LOAD",
    barPercent: 67,
    lottieSrc: "/obj-console/siteisundercunstruction.lottie",
  },
};

export default function GamingStatusScreen({
  variant,
  code,
  hudLabel,
  title,
  description,
  flavorText,
  quickLinks = [],
}: GamingStatusScreenProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const is404 = variant === "not-found";

  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-16 sm:py-20">
      {/* 🎬 DOTLOTTIE BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <DotLottieReact
          src={config.lottieSrc}
          loop
          autoplay
          className="h-full w-full object-cover scale-110 opacity-40"
        />
        {/* cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* HUD glow */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${config.glow} z-10`}
      />

      {/* scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.15)_2px,rgba(255,255,255,0.15)_3px)]"
      />

      {/* content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-20 w-full max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-[28px] border border-white/10  p-6 shadow-[0_0_80px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-10">
          <p
            className={`mb-4 text-center text-[10px] tracking-[0.35em] sm:text-xs ${config.accent}`}
          >
            {hudLabel}
          </p>

          {/* icon */}
          <div className="mb-6 flex justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${
                is404
                  ? "border-red-400/40 bg-red-500/10"
                  : "border-amber-400/40 bg-amber-500/10"
              }`}
            >
              <Icon
                className={`h-9 w-9 ${is404 ? "text-red-300" : "text-amber-200"}`}
              />
            </div>
          </div>

          {/* code */}
          <p
            className={`text-center text-6xl font-bold sm:text-8xl ${
              is404 ? "text-red-400" : "text-amber-300"
            }`}
          >
            {code}
          </p>

          <h1 className="mt-4 text-center text-2xl font-bold text-white sm:text-3xl">
            {title}
          </h1>

          <p className="mt-3 text-center text-sm text-zinc-400">
            {description}
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-white"
            >
              <Home className="h-5 w-5" />
              بازگشت به خانه
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-zinc-600">
          فیکس‌بازی · تعمیر تخصصی کنسول
        </p>
      </motion.div>
    </main>
  );
}

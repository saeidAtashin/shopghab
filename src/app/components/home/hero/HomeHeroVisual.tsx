"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import type { CaseTemplate } from "@/lib/design/types";
import HomeHeroFloatingCases from "./HomeHeroFloatingCases";
import { HomeHeroPhoneMockupSkeleton } from "./HomeHeroPhoneMockupSkeleton";
import { useMouseParallax } from "./hooks/useMouseParallax";

const HomeHeroPhoneMockup = dynamic(() => import("./HomeHeroPhoneMockup"), {
  ssr: false,
  loading: () => <HomeHeroPhoneMockupSkeleton />,
});

type Props = {
  templates: CaseTemplate[];
};

export default function HomeHeroVisual({ templates }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const parallax = useMouseParallax(0.45);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
      className="relative mx-auto flex min-h-[360px] w-full max-w-[560px] items-center justify-center lg:max-w-none"
      aria-label="پیش‌نمایش قاب موبایل"
    >
      <motion.div
        className="relative w-full"
        style={prefersReducedMotion ? undefined : { x: parallax.x * 0.5, y: parallax.y * 0.5 }}
      >
        <HomeHeroFloatingCases
          templates={templates}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        <div className="relative z-20 flex justify-center px-2 pt-6 sm:px-0 sm:pt-0">
          <HomeHeroPhoneMockup
            templates={templates}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

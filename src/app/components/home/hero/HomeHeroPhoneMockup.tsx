"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import Tilt from "react-parallax-tilt";

import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import { getModelBySlug } from "@/lib/cases/brands.static";
import type { CaseTemplate } from "@/lib/design/types";
import { HERO_ARTWORK_INTERVAL_MS, HERO_PHONE } from "./hero.constants";
import { useMouseParallax } from "./hooks/useMouseParallax";

const DesignSamplePreview = dynamic(
  () => import("@/app/components/designs/DesignSamplePreview"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-surface" aria-hidden />
    ),
  },
);

type Props = {
  templates: CaseTemplate[];
  activeIndex: number;
  onActiveIndexChange: Dispatch<SetStateAction<number>>;
};

export default function HomeHeroPhoneMockup({
  templates,
  activeIndex,
  onActiveIndexChange,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const parallax = useMouseParallax(0.85);
  const model = getModelBySlug(HERO_PHONE.brandSlug, HERO_PHONE.modelSlug);
  const activeTemplate = templates[activeIndex] ?? templates[0];

  useEffect(() => {
    if (prefersReducedMotion || templates.length <= 1) return;
    const timer = window.setInterval(() => {
      onActiveIndexChange((prev) => (prev + 1) % templates.length);
    }, HERO_ARTWORK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [onActiveIndexChange, prefersReducedMotion, templates.length]);

  if (!model || !activeTemplate) {
    return (
      <div
        className="mx-auto aspect-[9/19] w-[min(100%,280px)] animate-pulse rounded-[2rem] bg-surface sm:w-[min(100%,320px)]"
        aria-hidden
      />
    );
  }

  const mockupInner = (
    <div className="relative mx-auto w-[min(100%,280px)] sm:w-[min(100%,320px)]">
      <div
        className="pointer-events-none absolute inset-[-12%] rounded-full bg-cyan-500/20 blur-3xl dark:bg-cyan-400/15"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-b from-zinc-100/80 to-zinc-200/40 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.18)] dark:from-zinc-900/80 dark:to-zinc-950/60 dark:shadow-[0_40px_100px_rgba(0,0,0,0.55)]">
        <div className="relative aspect-[280/560] w-full">
          <div className="absolute inset-0 overflow-hidden rounded-[1.4rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTemplate.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <DesignSamplePreview template={activeTemplate} maxHeight={520} />
              </motion.div>
            </AnimatePresence>
          </div>

          <PhoneBackSvg
            model={model}
            className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-2xl"
            bodyFill="transparent"
            showCamera
          />

          <div
            className="pointer-events-none absolute inset-0 rounded-[1.4rem] bg-gradient-to-tr from-white/10 via-transparent to-cyan-300/10"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return <div className="relative">{mockupInner}</div>;
  }

  return (
    <motion.div
      className="relative"
      style={{ x: parallax.x, y: parallax.y }}
      animate={{ y: [0, -14, 0] }}
      transition={{
        y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
      }}
    >
      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        glareEnable={false}
        scale={1.02}
        transitionSpeed={1200}
        className="transform-gpu"
      >
        {mockupInner}
      </Tilt>
    </motion.div>
  );
}
import { HomeHeroPhoneMockupSkeleton } from "./HomeHeroPhoneMockupSkeleton";
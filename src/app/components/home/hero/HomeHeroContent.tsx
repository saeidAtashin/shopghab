"use client";

import { motion, useReducedMotion } from "framer-motion";

import HomeHeroBadge from "./HomeHeroBadge";
import HomeHeroCta from "./HomeHeroCta";
import HomeHeroRating from "./HomeHeroRating";
import HomeHeroTrustBadges from "./HomeHeroTrustBadges";
import { HERO_DESCRIPTION, HERO_HEADING } from "./hero.constants";

type Variant = "default" | "onDark";

type Props = {
  variant?: Variant;
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function HomeHeroContent({ variant = "default" }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const onDark = variant === "onDark";

  const headingClass = onDark
    ? "mt-6 max-w-2xl text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.08] tracking-tight text-white"
    : "mt-6 max-w-2xl text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.08] tracking-tight text-foreground";

  const descriptionClass = onDark
    ? "mt-5 max-w-xl text-base leading-8 text-white/80 sm:text-lg"
    : "mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg";

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-start text-right">
        <HomeHeroBadge variant={variant} />
        <h1 id="home-hero-heading" className={headingClass}>
          {HERO_HEADING}
        </h1>
        <p className={descriptionClass}>{HERO_DESCRIPTION}</p>
        <div className="mt-8 w-full">
          <HomeHeroTrustBadges variant={variant} />
        </div>
        <div className="mt-8">
          <HomeHeroCta variant={variant} />
        </div>
        <div className="mt-6">
          <HomeHeroRating variant={variant} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-start text-right"
    >
      <motion.div variants={item}>
        <HomeHeroBadge variant={variant} />
      </motion.div>

      <motion.h1 id="home-hero-heading" variants={item} className={headingClass}>
        {HERO_HEADING}
      </motion.h1>

      <motion.p variants={item} className={descriptionClass}>
        {HERO_DESCRIPTION}
      </motion.p>

      <motion.div variants={item} className="mt-8 w-full">
        <HomeHeroTrustBadges variant={variant} />
      </motion.div>

      <motion.div variants={item} className="mt-8">
        <HomeHeroCta variant={variant} />
      </motion.div>

      <motion.div variants={item} className="mt-6">
        <HomeHeroRating variant={variant} />
      </motion.div>
    </motion.div>
  );
}

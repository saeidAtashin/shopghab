"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  animateY?: number[];
  duration?: number;
  delay?: number;
  onClick?: () => void;
  ariaLabel?: string;
};

export default function HomeHeroGlassCard({
  children,
  className,
  animateY = [0, -10, 0],
  duration = 5,
  delay = 0,
  onClick,
  ariaLabel,
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  const card = (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/55 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:bg-white/[0.06] dark:shadow-[0_8px_40px_rgba(0,0,0,0.35)]",
        onClick && "cursor-pointer transition hover:border-cyan-500/35 hover:bg-card/75",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );

  if (prefersReducedMotion) {
    return card;
  }

  return (
    <motion.div
      animate={{ y: animateY }}
      whileHover={{ scale: 1.04 }}
      transition={{
        y: { repeat: Infinity, duration, ease: "easeInOut", delay },
        scale: { duration: 0.25 },
      }}
      className="will-change-transform"
    >
      {card}
    </motion.div>
  );
}

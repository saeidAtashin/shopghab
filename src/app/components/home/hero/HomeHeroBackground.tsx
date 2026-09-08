"use client";

import { motion, useReducedMotion } from "framer-motion";

const ORBS = [
  { size: 320, x: "72%", y: "10%", color: "rgba(34,211,238,0.14)", delay: 0, duration: 10 },
  { size: 240, x: "10%", y: "18%", color: "rgba(168,85,247,0.12)", delay: 1, duration: 12 },
  { size: 180, x: "55%", y: "62%", color: "rgba(59,130,246,0.1)", delay: 0.5, duration: 11 },
  { size: 140, x: "20%", y: "70%", color: "rgba(34,211,238,0.08)", delay: 1.8, duration: 9 },
] as const;

export default function HomeHeroBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_15%,rgba(34,211,238,0.12),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_70%_15%,rgba(34,211,238,0.16),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_80%,rgba(168,85,247,0.08),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] [background-image:linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />

      {prefersReducedMotion
        ? null
        : ORBS.map((orb, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full blur-3xl"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.x,
                top: orb.y,
                background: orb.color,
              }}
              animate={{
                y: [0, -20, 8, -14, 0],
                x: [0, 10, -6, 4, 0],
                scale: [1, 1.06, 0.97, 1.03, 1],
              }}
              transition={{
                duration: orb.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: orb.delay,
              }}
            />
          ))}
    </div>
  );
}

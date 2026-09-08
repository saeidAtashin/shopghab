"use client";

import { motion, useReducedMotion } from "framer-motion";

const ORBS = [
  { size: 280, x: "8%", y: "12%", color: "rgba(34,211,238,0.18)", delay: 0, duration: 9 },
  { size: 200, x: "78%", y: "8%", color: "rgba(168,85,247,0.14)", delay: 1.2, duration: 11 },
  { size: 160, x: "65%", y: "55%", color: "rgba(59,130,246,0.12)", delay: 0.6, duration: 10 },
  { size: 120, x: "15%", y: "68%", color: "rgba(34,211,238,0.1)", delay: 2, duration: 8 },
  { size: 90, x: "45%", y: "30%", color: "rgba(236,72,153,0.08)", delay: 1.5, duration: 12 },
] as const;

export default function BlogFloatingOrbs() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(34,211,238,0.08),transparent_55%)]" />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {ORBS.map((orb, index) => (
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
            y: [0, -24, 8, -16, 0],
            x: [0, 12, -8, 6, 0],
            scale: [1, 1.08, 0.96, 1.04, 1],
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

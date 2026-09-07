"use client";

import { motion } from "framer-motion";
import React, { JSX, ReactNode } from "react";

interface FloatingBadgeProps {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  animateY?: number[];
  duration?: number;
  valueClassName?: string;
}

export default function FloatingBadge({
  label,
  value,
  className = "",
  animateY = [0, -10, 0],
  duration = 4,
  valueClassName = "text-white",
}: FloatingBadgeProps): JSX.Element {
  return (
    <motion.div
      animate={{ y: animateY }}
      transition={{
        repeat: Infinity,
        duration,
        ease: "easeInOut",
      }}
      className={`hidden rounded-2xl border px-4 py-3 backdrop-blur-xl lg:block ${className}`}
    >
      <div className="text-xs text-zinc-400">{label}</div>
      <div className={`mt-1 font-bold ${valueClassName}`}>{value}</div>
    </motion.div>
  );
}

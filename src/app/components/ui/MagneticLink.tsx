"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useMagneticRef } from "@/app/components/home/hero/hooks/useMagneticRef";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  magnetic?: boolean;
};

export default function MagneticLink({
  href,
  children,
  className,
  magnetic = true,
}: Props) {
  const { ref: magneticRef, x, y, active } = useMagneticRef<HTMLDivElement>();

  return (
    <div ref={magnetic ? magneticRef : undefined} className="relative inline-flex">
      {magnetic ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -m-3 rounded-2xl bg-cyan-500/10 blur-xl"
          animate={{ opacity: active ? 1 : 0, scale: active ? 1.05 : 0.92 }}
          transition={{ duration: 0.3 }}
        />
      ) : null}
      <motion.span style={magnetic ? { x, y } : undefined} className="inline-flex">
        <Link href={href} className={cn(className)}>
          {children}
        </Link>
      </motion.span>
    </div>
  );
}

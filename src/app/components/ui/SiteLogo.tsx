"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export default function SiteLogo({
  className,
  imageClassName,
  textClassName,
  showText = true,
}: SiteLogoProps) {
  const [src, setSrc] = useState("/logos/logo-nobg.png");

  return (
    <Link
      href="/"
      className={cn(
        "group rounded-xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-transform group-hover:scale-105 flex items-center gap-3 ",
        className,
      )}
    >
      {showText && (
        <div className={cn("text-right hidden p-2 sm:block", textClassName)}>
          <p className="text-[11px] font-mono text-cyan-500 leading-none tracking-tight lowercase">
            fix bazi
          </p>
          <p className="mt-1 text-base font-black text-foreground leading-none">
            فیکس<span className="text-cyan-500">‌بازی</span>
          </p>
        </div>
      )}

      <div
        className={cn("relative h-11 w-11 overflow-hidden ", imageClassName)}
      >
        <Image
          src={src}
          alt="fix bazi logo"
          fill
          sizes="84px"
          className="object-contain p-2"
          onError={() => setSrc("/logos/k3.png")}
          priority
        />
      </div>
    </Link>
  );
}

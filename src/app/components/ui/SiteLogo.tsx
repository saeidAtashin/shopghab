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
        "group flex items-center gap-3 rounded-xl border border-amber-400/25 bg-amber-500/10 shadow-[0_0_18px_rgba(245,158,11,0.2)] transition-transform group-hover:scale-105",
        className,
      )}
    >
      {showText && (
        <div className={cn("hidden p-2 text-right sm:block", textClassName)}>
          <p className="text-[11px] font-medium leading-none tracking-tight text-amber-400">
            Shopghab
          </p>
          <p className="mt-1 text-base font-black leading-none text-white">
            شاپ<span className="text-amber-400">‌قاب</span>
          </p>
        </div>
      )}

      <div
        className={cn("relative h-11 w-11 overflow-hidden", imageClassName)}
      >
        <Image
          src={src}
          alt="لوگوی شاپ‌قاب"
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

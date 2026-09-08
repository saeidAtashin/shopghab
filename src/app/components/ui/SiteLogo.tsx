"use client";

import Image from "next/image";
import Link from "next/link";

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
  showText = false,
}: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-3 transition-transform hover:scale-105",
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
        className={cn("relative h-12 w-36 overflow-hidden", imageClassName)}
      >
        <Image
          src="/logos/shop-ghab-logo.png"
          alt="لوگوی شاپ‌قاب"
          fill
          sizes="144px"
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
}

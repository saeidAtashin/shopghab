import Link from "next/link";

import { cn } from "@/lib/utils";

import MenuLogoMark from "./MenuLogoMark";

type SiteLogoProps = {
  className?: string;
  markClassName?: string;
  showText?: boolean;
  /** Light wordmark with a dark edge, for the bar over mixed banners. */
  onMedia?: boolean;
  onClick?: () => void;
};

export default function SiteLogo({
  className,
  markClassName,
  showText = true,
  onMedia = false,
  onClick,
}: SiteLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("group flex min-w-0 items-center gap-2.5", className)}
      aria-label={showText ? undefined : "شاپ قاب"}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/10">
        <MenuLogoMark className={cn("h-full w-full", markClassName)} />
      </span>
      {showText ? (
        <span className="min-w-0 whitespace-nowrap text-right">
          <span
            className={cn(
              "block text-[11px] font-medium leading-none tracking-tight text-amber-400",
              onMedia &&
                "[text-shadow:0_0_1px_#000,0_1px_2px_rgba(0,0,0,0.95),0_-1px_2px_rgba(0,0,0,0.85)]",
            )}
          >
            Shopghab
          </span>
          <span
            className={cn(
              "mt-1 block text-base font-black leading-none",
              onMedia
                ? "text-white [text-shadow:0_0_1px_#000,0_1px_2px_rgba(0,0,0,0.95),0_-1px_2px_rgba(0,0,0,0.85),1px_0_2px_rgba(0,0,0,0.85),-1px_0_2px_rgba(0,0,0,0.85)]"
                : "text-foreground",
            )}
          >
            شاپ<span className="text-amber-400">‌قاب</span>
          </span>
        </span>
      ) : null}
    </Link>
  );
}

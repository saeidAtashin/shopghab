import Image from "next/image";
import Link from "next/link";

import { designedAssetUrl } from "@/lib/designed-assets";
import type { TaxonomyCard } from "@/lib/landing/taxonomy";
import { cn } from "@/lib/utils";

type Props = {
  items: TaxonomyCard[];
  className?: string;
};

const ACCENTS = [
  {
    ring: "ring-[#7C6CFF]",
    circle: "shadow-[0_0_16px_rgba(124,108,255,0.7)]",
    tile: "shadow-[0_0_22px_rgba(124,108,255,0.42)] hover:shadow-[0_0_34px_rgba(124,108,255,0.72)]",
  },
  {
    ring: "ring-[#3DDC97]",
    circle: "shadow-[0_0_16px_rgba(61,220,151,0.65)]",
    tile: "shadow-[0_0_22px_rgba(61,220,151,0.38)] hover:shadow-[0_0_34px_rgba(61,220,151,0.68)]",
  },
  {
    ring: "ring-[#5B8CFF]",
    circle: "shadow-[0_0_16px_rgba(91,140,255,0.7)]",
    tile: "shadow-[0_0_22px_rgba(91,140,255,0.42)] hover:shadow-[0_0_34px_rgba(91,140,255,0.72)]",
  },
  {
    ring: "ring-[#F0A05A]",
    circle: "shadow-[0_0_16px_rgba(240,160,90,0.7)]",
    tile: "shadow-[0_0_22px_rgba(240,160,90,0.42)] hover:shadow-[0_0_34px_rgba(240,160,90,0.72)]",
  },
] as const;

function CategoryImage({ src, sizes, className }: { src: string; sizes: string; className?: string }) {
  if (!src) return null;
  return (
    <Image
      src={designedAssetUrl(src)}
      alt=""
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

const SCROLL_GUTTER = "pe-1 [scrollbar-width:thin]";

export default function HomeCategoryMosaic({ items, className }: Props) {
  if (items.length === 0) return null;
  const circles = [...items.slice(0, 4), ...items.slice(6)];
  const tiles = items.slice(4, 6);

  return (
    <section aria-label="دسته‌ها" className={cn("flex min-h-0 min-w-0 flex-col xl:h-full", className)}>
      <div className="xl:hidden">
        <ul
          className={cn(
            "grid auto-cols-[calc((100%-1.125rem)/4)] grid-flow-col gap-1.5 overflow-x-auto overscroll-x-contain pb-1",
            SCROLL_GUTTER,
          )}
        >
          {circles.map((item, index) => (
            <li key={item.id} className="min-w-0">
              <Link href={item.href} className="flex min-w-0 flex-col items-center gap-2">
                <span
                  className={cn(
                    "relative block h-14 w-14 overflow-hidden rounded-full bg-surface ring-2",
                    ACCENTS[index % ACCENTS.length].ring,
                    ACCENTS[index % ACCENTS.length].circle,
                  )}
                >
                  <CategoryImage src={item.image} sizes="56px" className="object-center" />
                </span>
                <span className="line-clamp-2 w-full text-center text-[10px] font-bold leading-4 text-foreground">
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {tiles.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {tiles.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  href={item.href}
                  className="group relative block aspect-[5/4] overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <CategoryImage
                    src={item.image}
                    sizes="50vw"
                    className="transition duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080D18] via-[#080D18]/70 to-transparent px-3 pb-3 pt-8 text-sm font-bold text-white">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div
        className={cn(
          "hidden h-full min-h-0 gap-3 overflow-y-auto overscroll-contain xl:grid xl:grid-cols-2 xl:auto-rows-[calc((100%-1.5rem)/3)]",
          SCROLL_GUTTER,
        )}
      >
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group relative block h-full min-h-0 overflow-hidden rounded-2xl bg-[#05070e] ring-1 transition duration-300",
              ACCENTS[index % ACCENTS.length].ring,
              ACCENTS[index % ACCENTS.length].tile,
            )}
          >
            <CategoryImage
              src={item.image}
              sizes="14rem"
              className="object-center transition duration-500 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070e] via-[#05070e]/55 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 z-10 p-3">
              <span className="line-clamp-2 block text-sm font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
                {item.title}
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                {item.count.toLocaleString("fa-IR")} طرح
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

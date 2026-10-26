import Image from "next/image";
import Link from "next/link";

import { designedAssetUrl } from "@/lib/designed-assets";
import type { TaxonomyCard } from "@/lib/landing/taxonomy";
import { cn } from "@/lib/utils";

type Props = {
  items: TaxonomyCard[];
  className?: string;
};

const RINGS = ["ring-[#7C6CFF]", "ring-[#3DDC97]", "ring-[#5B8CFF]", "ring-[#F0A05A]"] as const;

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

export default function HomeCategoryMosaic({ items, className }: Props) {
  if (items.length === 0) return null;
  const circles = items.slice(0, 4);
  const tiles = items.slice(4, 6);

  return (
    <section aria-label="دسته‌ها" className={cn("min-w-0", className)}>
      <div className="xl:hidden">
        <ul className="grid grid-cols-4 gap-2">
          {circles.map((item, index) => (
            <li key={item.id}>
              <Link href={item.href} className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "relative block h-16 w-16 overflow-hidden rounded-full bg-surface ring-2 ring-offset-2 ring-offset-[#080D18]",
                    RINGS[index % RINGS.length],
                  )}
                >
                  <CategoryImage src={item.image} sizes="64px" />
                </span>
                <span className="line-clamp-2 text-center text-[11px] font-bold leading-4 text-foreground">
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {tiles.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {tiles.map((item) => (
              <li key={item.id}>
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

      <div className="hidden h-full gap-3 xl:grid xl:grid-cols-2 xl:grid-rows-3">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex min-h-0 items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2 transition hover:border-[#5145FF]/45"
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
              <CategoryImage src={item.image} sizes="56px" />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-1 block text-sm font-bold text-foreground">{item.title}</span>
              <span className="mt-1 block text-[11px] text-muted">
                {item.count.toLocaleString("fa-IR")} طرح
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

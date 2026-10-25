import Image from "next/image";
import Link from "next/link";

import { designedAssetUrl } from "@/lib/designed-assets";
import type { TaxonomyCard } from "@/lib/landing/taxonomy";
import { cn } from "@/lib/utils";

type Props = {
  items: TaxonomyCard[];
  hasMore?: boolean;
  className?: string;
};

export default function HomeCategoryMosaic({ items, hasMore = false, className }: Props) {
  if (items.length === 0) return null;

  return (
    <section aria-label="دسته‌ها" className={cn("min-w-0", className)}>
      <div className="flex gap-3 overflow-x-auto pb-1 xl:grid xl:h-full xl:grid-cols-2 xl:overflow-visible xl:pb-0">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex min-w-[10.5rem] snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-[#5145FF]/45 xl:min-w-0"
          >
            <span className="relative block h-24 bg-surface sm:h-28">
              {item.image ? (
                <Image
                  src={designedAssetUrl(item.image)}
                  alt=""
                  fill
                  sizes="180px"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : null}
            </span>
            <span className="flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="line-clamp-1 text-sm font-bold text-foreground">{item.title}</span>
              <span className="shrink-0 text-[11px] text-muted">
                {item.count.toLocaleString("fa-IR")} طرح
              </span>
            </span>
          </Link>
        ))}
        {hasMore ? (
          <Link
            href="/designs"
            className="flex min-w-[10.5rem] items-center justify-center rounded-2xl border border-dashed border-border px-3 text-sm font-bold text-[#C4C0FF] transition hover:border-[#5145FF]/50 xl:min-w-0"
          >
            همه دسته‌ها
          </Link>
        ) : null}
      </div>
    </section>
  );
}

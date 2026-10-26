"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { designedAssetUrl } from "@/lib/designed-assets";
import type { TaxonomyCard } from "@/lib/landing/taxonomy";

type Props = {
  cards: TaxonomyCard[];
};

export default function HomeCollections({ cards }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: number) {
    const node = scroller.current;
    if (!node) return;
    const amount = Math.max(node.clientWidth * 0.75, 240);
    const rtl = getComputedStyle(node).direction === "rtl";
    node.scrollBy({ left: direction * amount * (rtl ? -1 : 1), behavior: "smooth" });
  }

  if (cards.length === 0) return null;

  return (
    <section aria-label="کالکشن‌های پیشنهادی" className="hidden pt-2 xl:block">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-foreground">کالکشن‌های پیشنهادی</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="کالکشن قبلی"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition hover:border-[#5145FF]/50"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="کالکشن بعدی"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition hover:border-[#5145FF]/50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <Link href="/designs" className="text-sm font-bold text-[#C4C0FF] hover:underline">
            مشاهده همه
          </Link>
        </div>
      </div>
      <div ref={scroller} className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative h-36 min-w-[16rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
          >
            {card.image ? (
              <Image
                src={designedAssetUrl(card.image)}
                alt=""
                fill
                sizes="256px"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            ) : null}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080D18] via-[#080D18]/75 to-transparent px-3 pb-3 pt-10">
              <span className="line-clamp-1 block text-sm font-bold text-white">{card.title}</span>
              {card.count > 0 ? (
                <span className="mt-1 block text-xs text-white/70">
                  {card.count.toLocaleString("fa-IR")} طرح
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

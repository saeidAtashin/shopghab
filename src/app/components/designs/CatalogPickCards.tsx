import Image from "next/image";
import Link from "next/link";

import { designedAssetUrl } from "@/lib/designed-assets";
import type { PublicPickCard } from "@/lib/catalog/logic";

export default function CatalogPickCards({ cards }: { cards: PublicPickCard[] }) {
  if (cards.length === 0) return null;

  return (
    <section aria-label="پیشنهادها" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.slug}
          href={card.href}
          className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card/60 px-3 py-3 text-right transition hover:border-cyan-500/40"
        >
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.16),transparent_70%)]">
            {card.image ? (
              <Image
                src={designedAssetUrl(card.image)}
                alt=""
                fill
                sizes="64px"
                className="pointer-events-none object-cover"
              />
            ) : null}
          </span>
          <span className="min-w-0 text-sm font-black text-foreground">{card.title}</span>
        </Link>
      ))}
    </section>
  );
}

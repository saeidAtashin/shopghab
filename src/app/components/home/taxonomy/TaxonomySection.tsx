import Link from "next/link";

import TaxonomyCards from "@/app/components/home/taxonomy/TaxonomyCards";
import type { LandingCardStyle } from "@/lib/landing/sections";
import type { TaxonomyCard } from "@/lib/landing/taxonomy";

type Props = {
  title: string;
  description?: string;
  items: TaxonomyCard[];
  style: LandingCardStyle;
  seeAllHref?: string;
};

export default function TaxonomySection({ title, description, items, style, seeAllHref }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {seeAllHref ? (
            <Link href={seeAllHref} className="shrink-0 text-sm text-cyan-400 hover:underline">
              همه
            </Link>
          ) : null}
        </div>
        <TaxonomyCards items={items} style={style} />
      </div>
    </section>
  );
}

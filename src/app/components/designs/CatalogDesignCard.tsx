import Link from "next/link";

import DesignArtworkStage from "@/app/components/designs/DesignArtworkStage";
import { designImageAlt } from "@/lib/mockups/display";
import type { PublicDesign } from "@/lib/catalog/schema";

type Props = {
  design: PublicDesign;
  categoryName?: string;
  priority?: boolean;
};

export default function CatalogDesignCard({ design, categoryName, priority = false }: Props) {
  const alt = designImageAlt(design);
  const href = `/designs/${design.slug}`;

  return (
    <article className="group/card flex flex-col overflow-hidden rounded-3xl border border-border bg-card/60 text-right shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35">
      <div className="relative">
        {categoryName ? (
          <span className="pointer-events-none absolute end-2.5 top-2.5 z-20 rounded-lg border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm">
            {categoryName}
          </span>
        ) : null}
        <DesignArtworkStage
          id={design.id}
          src={design.artworkPath}
          alt={alt}
          priority={priority}
          sizes="(max-width: 640px) 50vw, 25vw"
          className="h-40 sm:h-44"
        />
      </div>
      <Link
        href={href}
        className="flex flex-1 flex-col gap-2 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      >
        <h2 className="line-clamp-2 text-sm font-bold text-foreground">{design.title}</h2>
        {design.shortDescription ? (
          <p className="line-clamp-2 text-xs leading-6 text-muted">{design.shortDescription}</p>
        ) : null}
      </Link>
    </article>
  );
}

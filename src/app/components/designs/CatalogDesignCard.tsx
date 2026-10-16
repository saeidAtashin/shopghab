import Image from "next/image";
import Link from "next/link";

import { designImageAlt } from "@/lib/mockups/display";
import { designedAssetUrl } from "@/lib/designed-assets";
import type { PublicDesign } from "@/lib/catalog/schema";

type Props = {
  design: PublicDesign;
  categoryName?: string;
  priority?: boolean;
};

export default function CatalogDesignCard({ design, categoryName, priority = false }: Props) {
  const image = design.thumbnailPath || design.imagePath;
  const alt = designImageAlt(design);

  return (
    <Link
      href={`/designs/${design.slug}`}
      className="group/card flex flex-col overflow-hidden rounded-3xl border border-border bg-card/60 text-right shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
    >
      <div className="relative h-40 overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%)] sm:h-44">
        {categoryName ? (
          <span className="absolute end-2.5 top-2.5 z-10 rounded-lg border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm">
            {categoryName}
          </span>
        ) : null}
        {image ? (
          <Image
            src={designedAssetUrl(image)}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain p-3"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted">بدون تصویر</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="line-clamp-2 text-sm font-bold text-foreground">{design.title}</h2>
        {design.shortDescription ? (
          <p className="line-clamp-2 text-xs leading-6 text-muted">{design.shortDescription}</p>
        ) : null}
      </div>
    </Link>
  );
}

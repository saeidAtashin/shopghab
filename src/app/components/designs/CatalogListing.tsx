import CatalogDesignCard from "@/app/components/designs/CatalogDesignCard";
import CatalogPagination from "@/app/components/designs/CatalogPagination";
import type { BrowseSort } from "@/lib/catalog/browse";
import type { PublicDesign } from "@/lib/catalog/schema";

type Props = {
  designs: PublicDesign[];
  categoryNames: Record<string, string>;
  basePath: string;
  q: string;
  sort: BrowseSort;
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  attr?: string;
  sub?: string;
  showResults?: boolean;
  viewAll?: boolean;
  heading?: string;
};

export default function CatalogListing({
  designs,
  categoryNames,
  basePath,
  q,
  sort,
  page,
  pageSize,
  pageCount,
  total,
  attr = "",
  sub = "",
  showResults = true,
  viewAll = false,
  heading,
}: Props) {
  if (!showResults) return null;

  return (
    <div className="space-y-4">
      {heading ? <h2 className="text-lg font-black text-foreground">{heading}</h2> : null}

      {designs.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-6 py-10 text-center text-muted">
          طرحی با این شرایط پیدا نشد.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {designs.map((design, index) => (
            <CatalogDesignCard
              key={design.id}
              design={design}
              compact
              priority={index === 0}
              categoryName={categoryNames[design.categoryIds.find((id) => categoryNames[id]) ?? ""]}
            />
          ))}
        </div>
      )}

      <CatalogPagination
        pathname={basePath}
        q={q}
        sort={sort}
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        total={designs.length === 0 ? 0 : total}
        attr={attr}
        sub={sub}
        viewAll={viewAll}
      />
    </div>
  );
}

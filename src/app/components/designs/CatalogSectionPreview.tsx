import BrowseLink from "@/app/components/designs/BrowseLink";
import CatalogDesignCard from "@/app/components/designs/CatalogDesignCard";
import type { PublicBrowseSection } from "@/lib/catalog/logic";

export default function CatalogSectionPreview({ section }: { section: PublicBrowseSection }) {
  return (
    <section aria-labelledby={`browse-section-${section.id}`} className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`browse-section-${section.id}`} className="truncate text-base font-black text-foreground">
            {section.title}
          </h2>
          <p className="text-xs text-muted">{section.count.toLocaleString("fa-IR")} طرح</p>
        </div>
        <BrowseLink href={section.href} className="shrink-0 text-sm font-bold text-cyan-300 hover:underline">
          مشاهده همه
        </BrowseLink>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {section.designs.map((design, index) => (
          <CatalogDesignCard key={design.id} design={design} compact priority={index === 0} />
        ))}
      </div>
    </section>
  );
}

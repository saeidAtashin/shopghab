import BrowseLink from "@/app/components/designs/BrowseLink";
import CatalogDesignCard from "@/app/components/designs/CatalogDesignCard";
import { categoryVisual, sectionLayout, type SectionLayout } from "@/app/components/designs/browse-visuals";
import type { PublicBrowseSection } from "@/lib/catalog/logic";
import type { PublicDesign } from "@/lib/catalog/schema";
import { cn } from "@/lib/utils";

type Props = {
  section: PublicBrowseSection;
  index: number;
};

export default function CatalogSectionPreview({ section, index }: Props) {
  const layout = sectionLayout(section.slug, index);
  const { accent } = categoryVisual(section.slug);

  return (
    <section
      aria-labelledby={`browse-section-${section.id}`}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/70 border-s-4 p-3 sm:p-5",
        accent.edge,
        layout === "filmstrip" && accent.wash,
      )}
    >
      <SectionHeading section={section} index={index} layout={layout} />
      <div className="mt-4">
        <SectionBody layout={layout} designs={section.designs} />
      </div>
    </section>
  );
}

function SectionHeading({
  section,
  index,
  layout,
}: {
  section: PublicBrowseSection;
  index: number;
  layout: SectionLayout;
}) {
  const { accent } = categoryVisual(section.slug);
  return (
    <div
      className={cn(
        "relative flex items-end justify-between gap-3",
        layout === "editorial" && cn("rounded-2xl p-4", accent.wash),
      )}
    >
      {layout === "stage" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-3 end-0 text-6xl font-black leading-none text-foreground/5 sm:text-7xl"
        >
          {(index + 1).toLocaleString("fa-IR")}
        </span>
      ) : null}
      <div className="relative min-w-0">
        <h2 id={`browse-section-${section.id}`} className="truncate text-lg font-black text-foreground sm:text-xl">
          {section.title}
        </h2>
        <p className={cn("text-xs font-semibold", accent.text)}>
          {section.count.toLocaleString("fa-IR")} طرح
        </p>
      </div>
      <BrowseLink
        href={section.href}
        className={cn("relative shrink-0 rounded-full px-3 py-2 text-sm font-bold", accent.soft, accent.text)}
      >
        مشاهده همه
      </BrowseLink>
    </div>
  );
}

function SectionBody({ layout, designs }: { layout: SectionLayout; designs: PublicDesign[] }) {
  if (designs.length === 0) return null;
  const [lead, ...rest] = designs;

  if (layout === "stage" && lead) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="sm:col-span-3">
            <CatalogDesignCard design={lead} compact frame="lead" priority />
          </div>
          <div className="grid gap-3 sm:col-span-2">
            {rest.slice(0, 2).map((design) => (
              <CatalogDesignCard key={design.id} design={design} compact />
            ))}
          </div>
        </div>
        {rest.length > 2 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rest.slice(2).map((design) => (
              <CatalogDesignCard key={design.id} design={design} compact />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (layout === "filmstrip") {
    return (
      <div className="flex snap-x gap-3 overflow-x-auto pb-2">
        {designs.map((design, index) => (
          <div key={design.id} className="w-44 shrink-0 snap-start sm:w-52">
            <CatalogDesignCard design={design} compact frame="portrait" priority={index === 0} />
          </div>
        ))}
      </div>
    );
  }

  if (layout === "bento" && lead) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 sm:row-span-2">
          <CatalogDesignCard design={lead} compact frame="lead" priority />
        </div>
        {rest.map((design) => (
          <CatalogDesignCard key={design.id} design={design} compact />
        ))}
      </div>
    );
  }

  if (layout === "stagger") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {designs.map((design, index) => (
          <div key={design.id} className={index % 2 === 1 ? "sm:mt-8" : undefined}>
            <CatalogDesignCard
              design={design}
              compact
              frame={index % 2 === 0 ? "portrait" : "base"}
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {designs.map((design, index) => (
        <CatalogDesignCard key={design.id} design={design} compact priority={index === 0} />
      ))}
    </div>
  );
}

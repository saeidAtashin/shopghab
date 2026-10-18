import TaxonomyCards from "@/app/components/home/taxonomy/TaxonomyCards";
import { LANDING_CARD_STYLES, LANDING_SECTION_COPY, type LandingSectionKey } from "@/lib/landing/sections";
import type { LandingTaxonomy } from "@/lib/landing/taxonomy";

const ORDER: LandingSectionKey[] = ["categories", "features", "collections"];

export default function DesignTaxonomyShowcase({ taxonomy }: { taxonomy: LandingTaxonomy }) {
  return (
    <div className="mb-12 space-y-14">
      {ORDER.map((key) => {
        const items = key === "features" ? taxonomy.featureGroups : taxonomy[key];
        if (items.length === 0) return null;
        const copy = LANDING_SECTION_COPY[key];
        return (
          <section key={key} aria-labelledby={`taxonomy-${key}`} className="space-y-6">
            <div>
              <h2 id={`taxonomy-${key}`} className="text-2xl font-black text-foreground">
                {copy.title}
              </h2>
              <p className="mt-1 text-sm text-muted">{copy.description}</p>
            </div>
            {LANDING_CARD_STYLES.map((style) => (
              <div key={style.id}>
                <h3 className="mb-3 text-xs font-bold tracking-wide text-cyan-300">{style.label}</h3>
                <TaxonomyCards items={items} style={style.id} contained={style.id === "bento"} />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

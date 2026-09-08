import Link from "next/link";
import type { PhoneModel } from "@/lib/cases/types";
import { getSeriesBySlug, groupModelsBySeries } from "@/lib/cases/series";
import { PhoneBackSvg } from "./PhoneBackSvg";

type Props = {
  brandSlug: string;
  models: PhoneModel[];
  seriesSlug?: string;
};

function ModelCards({ brandSlug, models }: { brandSlug: string; models: PhoneModel[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {models.map((model) => (
        <Link
          key={model.slug}
          href={`/phones/${brandSlug}/${model.slug}`}
          className="group rounded-2xl border border-border bg-card/60 p-4 transition hover:border-cyan-500/50 hover:bg-card"
        >
          <div className="relative mx-auto flex h-36 w-20 items-center justify-center">
            <PhoneBackSvg
              model={model}
              className="h-full w-auto max-w-full drop-shadow-lg transition group-hover:scale-105"
            />
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm font-bold text-foreground">{model.name}</p>
            <p className="text-xs text-muted">{model.nameEn}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ModelGrid({ brandSlug, models, seriesSlug }: Props) {
  if (seriesSlug) {
    const series = getSeriesBySlug(brandSlug, seriesSlug);
    const filtered = models.filter((m) => m.seriesSlug === seriesSlug);

    return (
      <div className="space-y-6">
        {series ? (
          <div>
            <h2 className="text-lg font-bold text-foreground">{series.name}</h2>
            <p className="text-sm text-muted">{series.nameEn}</p>
          </div>
        ) : null}
        <ModelCards brandSlug={brandSlug} models={filtered} />
      </div>
    );
  }

  const groups = groupModelsBySeries(models, brandSlug);

  return (
    <div className="space-y-12">
      {groups.map(({ series, models: groupModels }) => (
        <section key={series.slug} id={series.slug} className="scroll-mt-28">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">{series.name}</h2>
              <p className="text-sm text-muted">{series.nameEn}</p>
            </div>
            <Link
              href={`/create/${brandSlug}?series=${series.slug}`}
              className="shrink-0 text-xs text-cyan-400 transition hover:text-cyan-300"
            >
              فقط این سری
            </Link>
          </div>
          <ModelCards brandSlug={brandSlug} models={groupModels} />
        </section>
      ))}
    </div>
  );
}

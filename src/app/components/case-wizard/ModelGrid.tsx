"use client";

import { useState } from "react";

import { buildCustomDesignPath } from "@/lib/cases/brands.static";
import { rememberSelectedPhone } from "@/lib/cases/device-phone";
import type { PhoneModel } from "@/lib/cases/types";
import { getSeriesBySlug, groupModelsBySeries } from "@/lib/cases/series";
import ModelPickerCard from "./ModelPickerCard";

type Props = {
  brandSlug: string;
  models: PhoneModel[];
  seriesSlug?: string;
  destination?: "editor" | "hub";
};

function modelHref(destination: "editor" | "hub", brandSlug: string, modelSlug: string): string {
  if (destination === "hub") return `/phones/${brandSlug}/${modelSlug}`;
  return buildCustomDesignPath(brandSlug, modelSlug);
}

function ModelCards({
  brandSlug,
  models,
  destination,
}: {
  brandSlug: string;
  models: PhoneModel[];
  destination: "editor" | "hub";
}) {
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {models.map((model) => (
        <ModelPickerCard
          key={model.slug}
          model={model}
          href={modelHref(destination, brandSlug, model.slug)}
          routeLoader={destination === "editor"}
          pending={pendingSlug === model.slug}
          namePrefix={destination === "hub" ? "قاب " : undefined}
          onClick={() => {
            rememberSelectedPhone({ brandSlug, modelSlug: model.slug });
            setPendingSlug(model.slug);
          }}
        />
      ))}
    </div>
  );
}

export default function ModelGrid({
  brandSlug,
  models,
  seriesSlug,
  destination = "editor",
}: Props) {
  if (seriesSlug) {
    const series = getSeriesBySlug(brandSlug, seriesSlug);
    const filtered = models.filter((model) => model.seriesSlug === seriesSlug);

    return (
      <div className="space-y-6">
        {series ? <h2 className="text-lg font-bold text-foreground">{series.name}</h2> : null}
        <ModelCards brandSlug={brandSlug} models={filtered} destination={destination} />
      </div>
    );
  }

  const groups = groupModelsBySeries(models, brandSlug);

  return (
    <div className="space-y-12">
      {groups.map(({ series, models: groupModels }) => (
        <section key={series.slug} id={series.slug} className="scroll-mt-36">
          <div className="mb-4 border-b border-border pb-3">
            <h2 className="text-lg font-bold text-foreground">{series.name}</h2>
          </div>
          <ModelCards brandSlug={brandSlug} models={groupModels} destination={destination} />
        </section>
      ))}
    </div>
  );
}

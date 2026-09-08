"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { formatToman } from "@/lib/shop/format";
import { getModelBySlug } from "@/lib/cases/brands.static";
import type { CaseType } from "@/lib/cases/types";
import PhoneMockupPreview from "./PhoneMockupPreview";

type Props = {
  brandSlug: string;
  modelSlug: string;
  caseTypes: CaseType[];
  selectedSlug?: string;
  onSelect?: (slug: string) => void;
  showDesignLink?: boolean;
  variant?: "full" | "compact";
};

export default function CaseTypePicker({
  brandSlug,
  modelSlug,
  caseTypes,
  selectedSlug,
  onSelect,
  showDesignLink = true,
  variant = "full",
}: Props) {
  const model = getModelBySlug(brandSlug, modelSlug);
  const selectedCase = caseTypes.find((c) => c.slug === selectedSlug) ?? caseTypes[0];
  const compact = variant === "compact";

  const caseList = (
    <div className="space-y-3">
      {caseTypes.map((caseType) => {
        const selected = selectedSlug === caseType.slug;
        return (
          <button
            key={caseType.slug}
            type="button"
            onClick={() => onSelect?.(caseType.slug)}
            className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-right transition ${
              selected
                ? "border-cyan-500/60 bg-cyan-500/10"
                : "border-border bg-card/60 hover:border-border"
            }`}
          >
            <div
              className="mt-1 h-10 w-10 shrink-0 rounded-lg border border-border"
              style={{ backgroundColor: caseType.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-foreground">{caseType.name}</p>
                {selected ? <Check size={18} className="shrink-0 text-cyan-400" /> : null}
              </div>
              <p className="mt-1 text-sm text-muted">{caseType.description}</p>
              <p className="mt-2 text-sm font-semibold text-cyan-400">
                {formatToman(caseType.price)}
                <span className="mr-2 text-xs font-normal text-muted">
                  + {formatToman(caseType.customizationFee)} طراحی
                </span>
              </p>
            </div>
          </button>
        );
      })}

      {showDesignLink && selectedSlug ? (
        <Link
          href={`/design/${brandSlug}/${modelSlug}/${selectedSlug}`}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-400"
        >
          شروع طراحی
        </Link>
      ) : null}
    </div>
  );

  if (compact) {
    return caseList;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card/40 p-8">
        <PhoneMockupPreview
          model={model}
          caseColor={selectedCase?.color}
          caseMaterial={selectedCase?.material}
        />
      </div>
      {caseList}
    </div>
  );
}

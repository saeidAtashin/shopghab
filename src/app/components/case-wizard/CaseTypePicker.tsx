"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { formatToman } from "@/lib/shop/format";
import {
  getModelBySlug,
  isCaseTypeSelectable,
  SELECTABLE_CASE_TYPE_SLUG,
} from "@/lib/cases/brands.static";
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
  const effectiveSlug = isCaseTypeSelectable(selectedSlug ?? "")
    ? selectedSlug
    : SELECTABLE_CASE_TYPE_SLUG;
  const selectedCase =
    caseTypes.find((c) => c.slug === effectiveSlug) ??
    caseTypes.find((c) => c.slug === SELECTABLE_CASE_TYPE_SLUG) ??
    caseTypes[0];
  const compact = variant === "compact";
  const selectableTypes = caseTypes.filter((c) => isCaseTypeSelectable(c.slug));
  const upcomingTypes = caseTypes.filter((c) => !isCaseTypeSelectable(c.slug));

  const caseList = (
    <div className="space-y-3">
      {selectableTypes.map((caseType) => {
        const selected = effectiveSlug === caseType.slug;
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

      {upcomingTypes.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-3">
          {upcomingTypes.map((caseType) => (
            <button
              key={caseType.slug}
              type="button"
              disabled
              aria-disabled="true"
              title="به‌زودی"
              className="flex w-full cursor-not-allowed items-center gap-2 rounded-xl border border-border/70 bg-card/40 p-2 text-right opacity-45 sm:items-start sm:gap-3 sm:rounded-2xl sm:p-3"
            >
              <div
                className="h-6 w-6 shrink-0 rounded-md border border-border sm:mt-0.5 sm:h-8 sm:w-8 sm:rounded-lg"
                style={{ backgroundColor: caseType.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {caseType.name}
                  </p>
                  <span className="shrink-0 rounded-full bg-muted/20 px-1.5 py-0.5 text-[9px] text-muted sm:text-[10px]">
                    به‌زودی
                  </span>
                </div>
                <p className="mt-1 hidden text-xs text-muted sm:block">{caseType.description}</p>
                <p className="mt-1 hidden text-xs font-semibold text-muted sm:block">
                  {formatToman(caseType.price)}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {showDesignLink && effectiveSlug ? (
        <Link
          href={`/design/${brandSlug}/${modelSlug}/${effectiveSlug}`}
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

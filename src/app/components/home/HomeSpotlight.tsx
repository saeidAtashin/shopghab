"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import ApplyTemplateWizard from "@/app/components/designs/ApplyTemplateWizard";
import { colorSwatch } from "@/app/components/designs/browse-visuals";
import { designedAssetUrl } from "@/lib/designed-assets";
import type { CaseTemplate } from "@/lib/design/types";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  image: string;
  alt: string;
  categoryName?: string;
  colors: string[];
  priceLabel: string;
  template: CaseTemplate | null;
  className?: string;
};

export default function HomeSpotlight({
  slug,
  title,
  image,
  alt,
  categoryName,
  colors,
  priceLabel,
  template,
  className,
}: Props) {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <aside className={cn("rounded-3xl border border-border bg-card p-3", className)}>
      <Link href={`/designs/${slug}`} className="block">
        <span className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
          {image ? (
            <Image
              src={designedAssetUrl(image)}
              alt={alt}
              fill
              priority
              sizes="280px"
              className="object-contain p-3"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted">بدون تصویر</span>
          )}
        </span>
      </Link>
      <div className="space-y-3 px-1 pb-1 pt-3">
        {categoryName ? <p className="text-xs text-muted">{categoryName}</p> : null}
        <h2 className="text-base font-black leading-7 text-foreground">
          <Link href={`/designs/${slug}`} className="hover:text-[#C4C0FF]">
            {title}
          </Link>
        </h2>
        {priceLabel ? <p className="text-sm font-bold text-foreground">{priceLabel}</p> : null}
        {colors.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="رنگ‌های طرح">
            {colors.slice(0, 6).map((color) => {
              const swatch = colorSwatch(color);
              return (
                <li key={color}>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-[11px] text-muted">
                    {typeof swatch === "string" ? (
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: swatch }}
                        aria-hidden
                      />
                    ) : null}
                    {color}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="flex flex-col gap-2">
          <Link
            href={`/designs/${slug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-l from-[#5145FF] to-[#6A5CFF] px-4 text-sm font-bold text-white"
          >
            مشاهده طرح
          </Link>
          {template ? (
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-bold text-foreground transition hover:border-[#5145FF]/50"
            >
              انتخاب گوشی و سفارش
            </button>
          ) : null}
        </div>
      </div>
      {template && wizardOpen ? (
        <ApplyTemplateWizard template={template} open onClose={() => setWizardOpen(false)} />
      ) : null}
    </aside>
  );
}

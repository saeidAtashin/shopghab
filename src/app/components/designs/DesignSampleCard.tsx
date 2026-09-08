"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layers, Smartphone } from "lucide-react";

import { designedAssetUrl } from "@/lib/designed-assets";
import { categoryLabel } from "@/lib/designed-categories";
import type { CaseTemplate } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import DesignSamplePhoneHover from "./DesignSamplePhoneHover";
import DesignSamplePreview from "./DesignSamplePreview";

type Props = {
  template: CaseTemplate;
  onSelect?: (template: CaseTemplate) => void;
  href?: string;
  /** Use Konva preview instead of thumbnail image (detail views). */
  useLivePreview?: boolean;
  priority?: boolean;
};

const cardClassName = cn(
  "group/card flex flex-col overflow-hidden rounded-3xl border border-border bg-card/60 text-right shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)]",
  "transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-[0_16px_48px_-12px_rgba(34,211,238,0.25)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
);

export default function DesignSampleCard({
  template,
  onSelect,
  href,
  useLivePreview = false,
  priority = false,
}: Props) {
  const [isActive, setIsActive] = useState(false);

  const interactionHandlers = {
    onMouseEnter: () => setIsActive(true),
    onMouseLeave: () => setIsActive(false),
    onFocus: () => setIsActive(true),
    onBlur: () => setIsActive(false),
  };

  const content = (
    <>
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)] p-3 sm:h-44">
        <div
          className="pointer-events-none absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl animate-preview-glow motion-reduce:animate-none"
          aria-hidden
        />

        <div className="absolute start-2.5 top-2.5 z-10 flex max-w-[calc(100%-5rem)] flex-wrap gap-1">
          {template.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-cyan-500/25 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-cyan-300 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {template.category ? (
          <span className="absolute end-2.5 top-2.5 z-10 rounded-lg border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm">
            {categoryLabel(template.category)}
          </span>
        ) : null}

        <div className="relative z-[1] overflow-hidden rounded-[1.75rem] border border-border/80 bg-background/40 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_-8px_rgba(0,0,0,0.45)] transition duration-300 motion-reduce:transition-none group-hover/card:scale-95 group-hover/card:opacity-0 group-focus-within/card:scale-95 group-focus-within/card:opacity-0">
          {useLivePreview ? (
            <DesignSamplePreview template={template} maxHeight={140} />
          ) : (
            <Image
              src={designedAssetUrl(template.thumbnail)}
              alt={template.title}
              width={280}
              height={560}
              className="h-full w-auto max-h-[132px] object-contain sm:max-h-[140px]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading={priority ? undefined : "lazy"}
              priority={priority}
            />
          )}
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[3] overflow-hidden opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:transition-none"
          aria-hidden
        >
          <DesignSamplePhoneHover template={template} active={isActive} />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/3 bg-gradient-to-t from-background/80 via-background/20 to-transparent"
          aria-hidden
        />
      </div>

      <div className="border-t border-border/80 p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover/card:text-cyan-400">
          {template.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted">{template.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-cyan-400">
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3 w-3 shrink-0" aria-hidden />
            {template.layers.length} لایه
          </span>
          <span className="text-border" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1 text-muted">
            <Smartphone className="h-3 w-3 shrink-0 text-cyan-400/80" aria-hidden />
            هر مدل گوشی
          </span>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName} {...interactionHandlers}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onSelect?.(template)} className={cardClassName} {...interactionHandlers}>
      {content}
    </button>
  );
}

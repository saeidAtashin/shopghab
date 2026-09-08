"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import ApplyTemplateWizard from "@/app/components/designs/ApplyTemplateWizard";
import DesignedCategoryFilters from "@/app/components/designs/DesignedCategoryFilters";
import DesignSampleGrid from "@/app/components/designs/DesignSampleGrid";
import { filterDesignedTemplates } from "@/lib/designed-categories";
import type { CaseTemplate } from "@/lib/design/types";

type Props = {
  templates: CaseTemplate[];
  limit?: number;
  title?: string;
  description?: string;
  showViewAll?: boolean;
  linkMode?: boolean;
  initialBrandSlug?: string;
  initialModelSlug?: string;
  showFilters?: boolean;
};

export default function DesignSamplesSection({
  templates,
  limit,
  title = "طراحی‌های آماده",
  description = "روی هر مدل گوشی قابل استفاده — انتخاب کنید، مدل را مشخص کنید و ویرایش کنید",
  showViewAll = true,
  linkMode = false,
  initialBrandSlug,
  initialModelSlug,
  showFilters = true,
}: Props) {
  const [activeTemplate, setActiveTemplate] = useState<CaseTemplate | null>(null);
  const [category, setCategory] = useState<string | undefined>();
  const [subcategory, setSubcategory] = useState<string | undefined>();

  const filteredTemplates = useMemo(
    () => filterDesignedTemplates(templates, { category, subcategory }),
    [templates, category, subcategory],
  );

  const displayTemplates =
    limit != null ? filteredTemplates.slice(0, limit) : filteredTemplates;

  function handleCategoryChange(next: string | undefined) {
    setCategory(next);
    setSubcategory(undefined);
  }

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Sparkles size={24} className="text-cyan-400" />
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        {showViewAll ? (
          <Link href="/designs" className="shrink-0 text-sm text-cyan-400 hover:underline">
            مشاهده همه
          </Link>
        ) : null}
      </div>

      {showFilters && templates.some((t) => t.category) ? (
        <div className="mb-6">
          <DesignedCategoryFilters
            templates={templates}
            category={category}
            subcategory={subcategory}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={setSubcategory}
          />
        </div>
      ) : null}

      {displayTemplates.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-muted">
          طراحی‌ای در این دسته یافت نشد.
        </p>
      ) : (
        <DesignSampleGrid
          templates={displayTemplates}
          linkMode={linkMode}
          onSelect={linkMode ? undefined : setActiveTemplate}
        />
      )}

      {activeTemplate ? (
        <ApplyTemplateWizard
          template={activeTemplate}
          open
          onClose={() => setActiveTemplate(null)}
          initialBrandSlug={initialBrandSlug}
          initialModelSlug={initialModelSlug}
        />
      ) : null}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DesignedCategoryFilters from "@/app/components/designs/DesignedCategoryFilters";
import DesignSampleGrid from "@/app/components/designs/DesignSampleGrid";
import { filterDesignedTemplates } from "@/lib/designed-categories";
import type { CaseTemplate } from "@/lib/design/types";

const PAGE_SIZE = 24;

type Props = {
  templates: CaseTemplate[];
};

export default function DesignsGalleryClient({ templates }: Props) {
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState<string | undefined>();
  const [subcategory, setSubcategory] = useState<string | undefined>();

  const filteredTemplates = useMemo(
    () => filterDesignedTemplates(templates, { category, subcategory }),
    [templates, category, subcategory],
  );

  const pageCount = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const pageTemplates = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredTemplates.slice(start, start + PAGE_SIZE);
  }, [filteredTemplates, safePage]);

  function handleCategoryChange(next: string | undefined) {
    setCategory(next);
    setSubcategory(undefined);
    setPage(0);
  }

  function handleSubcategoryChange(next: string | undefined) {
    setSubcategory(next);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <DesignedCategoryFilters
        templates={templates}
        category={category}
        subcategory={subcategory}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
      />

      {filteredTemplates.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-muted">
          طراحی‌ای در این دسته یافت نشد.
        </p>
      ) : (
        <DesignSampleGrid templates={pageTemplates} linkMode priorityFirst />
      )}

      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted">
            نمایش {safePage * PAGE_SIZE + 1}–
            {Math.min((safePage + 1) * PAGE_SIZE, filteredTemplates.length)} از{" "}
            {filteredTemplates.length} طراحی
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition enabled:hover:border-cyan-500/50 disabled:opacity-40"
              aria-label="صفحه قبل"
            >
              <ChevronRight size={16} />
              قبلی
            </button>
            <span className="min-w-[4rem] text-center text-sm text-muted">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition enabled:hover:border-cyan-500/50 disabled:opacity-40"
              aria-label="صفحه بعد"
            >
              بعدی
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import {
  buildCategoryIndex,
  categoryLabel,
  subcategoryLabel,
} from "@/lib/designed-categories";
import type { CaseTemplate } from "@/lib/design/types";

type Props = {
  templates: CaseTemplate[];
  category: string | undefined;
  subcategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
  onSubcategoryChange: (subcategory: string | undefined) => void;
};

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
          : "border-border bg-card/60 text-muted hover:border-cyan-500/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function DesignedCategoryFilters({
  templates,
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
}: Props) {
  const index = buildCategoryIndex(templates);
  const subcategories = category ? (index.subcategoriesByCategory[category] ?? []) : [];

  if (index.categories.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={!category} onClick={() => onCategoryChange(undefined)}>
          همه
        </FilterChip>
        {index.categories.map((cat) => (
          <FilterChip
            key={cat}
            active={category === cat}
            onClick={() => onCategoryChange(cat)}
          >
            {categoryLabel(cat)}
          </FilterChip>
        ))}
      </div>

      {category && subcategories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!subcategory} onClick={() => onSubcategoryChange(undefined)}>
            همه
          </FilterChip>
          {subcategories.map((sub) => (
            <FilterChip
              key={sub}
              active={subcategory === sub}
              onClick={() => onSubcategoryChange(sub)}
            >
              {subcategoryLabel(sub)}
            </FilterChip>
          ))}
        </div>
      ) : null}
    </div>
  );
}

import type { CaseTemplate } from "@/lib/design/types";

export const DESIGNED_CATEGORY_LABELS: Record<string, string> = {
  abstract: "انتزاعی",
  islamic: "اسلامی",
  general: "عمومی",
};

export type DesignedCategoryIndex = {
  categories: string[];
  subcategoriesByCategory: Record<string, string[]>;
};

export type DesignedTemplateFilters = {
  category?: string;
  subcategory?: string;
};

function titleCase(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function categoryLabel(category: string): string {
  return DESIGNED_CATEGORY_LABELS[category] ?? titleCase(category);
}

export function subcategoryLabel(subcategory: string): string {
  if (subcategory === "others") return "سایر";
  return titleCase(subcategory);
}

export function buildCategoryIndex(templates: CaseTemplate[]): DesignedCategoryIndex {
  const categories = new Set<string>();
  const subcategoriesByCategory: Record<string, Set<string>> = {};

  for (const template of templates) {
    if (!template.category) continue;
    categories.add(template.category);
    const subs = subcategoriesByCategory[template.category] ?? new Set<string>();
    if (template.subcategory) subs.add(template.subcategory);
    subcategoriesByCategory[template.category] = subs;
  }

  const sortedCategories = [...categories].sort((a, b) =>
    categoryLabel(a).localeCompare(categoryLabel(b), "fa"),
  );

  const sortedSubcategories: Record<string, string[]> = {};
  for (const category of sortedCategories) {
    const subs = [...(subcategoriesByCategory[category] ?? [])].sort((a, b) => {
      if (a === "others") return 1;
      if (b === "others") return -1;
      return subcategoryLabel(a).localeCompare(subcategoryLabel(b), "fa");
    });
    sortedSubcategories[category] = subs;
  }

  return {
    categories: sortedCategories,
    subcategoriesByCategory: sortedSubcategories,
  };
}

export function filterDesignedTemplates(
  templates: CaseTemplate[],
  filters: DesignedTemplateFilters,
): CaseTemplate[] {
  return templates.filter((template) => {
    if (filters.category && template.category !== filters.category) return false;
    if (filters.subcategory && template.subcategory !== filters.subcategory) return false;
    return true;
  });
}

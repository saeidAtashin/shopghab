import {
  CASE_CATEGORY_LABELS,
  cases,
  formatCasePrice,
  getCaseBySlug,
  getFeaturedCases,
  PHONE_MODELS,
  type CaseCategory,
  type PhoneCase,
} from "@/app/data/cases";

export {
  CASE_CATEGORY_LABELS,
  cases,
  formatCasePrice,
  getCaseBySlug,
  getFeaturedCases,
  PHONE_MODELS,
  type CaseCategory,
  type PhoneCase,
};

export function filterCases(options?: {
  category?: CaseCategory;
  phoneModel?: string;
  query?: string;
}): PhoneCase[] {
  const query = options?.query?.trim().toLowerCase() ?? "";

  return cases.filter((item) => {
    if (options?.category && item.category !== options.category) return false;
    if (
      options?.phoneModel &&
      !item.phoneModels.some((model) => model === options.phoneModel)
    ) {
      return false;
    }
    if (!query) return true;
    const haystack = [item.title, item.description, ...item.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

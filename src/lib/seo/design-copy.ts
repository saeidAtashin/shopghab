import { categoryLabel } from "@/lib/designed-categories";
import type { CaseTemplate } from "@/lib/design/types";

type DesignCopyInput = Pick<
  CaseTemplate,
  "title" | "slug" | "category" | "tags" | "description"
>;

/** Source files use Latin filenames; shop titles are written in Persian. */
export function isFilenameDesignTitle(title: string): boolean {
  return !/[\u0600-\u06FF]/.test(title.trim());
}

function shortDesignId(value: string): string {
  return value
    .replace(/_generated$/i, "")
    .replace(/[_()-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function designPublicTitle(template: DesignCopyInput): string {
  const title = template.title.trim();
  if (!isFilenameDesignTitle(title)) return title;

  const category = template.category
    ? categoryLabel(template.category)
    : template.tags.find((tag) => /[\u0600-\u06FF]/.test(tag)) ?? "آماده";

  return `طرح قاب ${category} ${shortDesignId(title)}`;
}

export function designPublicDescription(template: DesignCopyInput): string {
  const title = designPublicTitle(template);
  if (!isFilenameDesignTitle(template.title) && template.description.trim()) {
    return template.description.trim();
  }

  return `${title} — طرح آماده برای چاپ روی قاب موبایل، قابل ویرایش و استفاده روی همه مدل‌ها.`;
}

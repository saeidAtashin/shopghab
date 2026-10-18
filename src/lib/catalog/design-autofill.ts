import { isWeakDesignAlt, suggestedDesignAlt, suggestedDesignSeoDescription, suggestedDesignSeoTitle } from "./seo-copy";
import { designPublicDescription, isFilenameDesignTitle } from "@/lib/seo/design-copy";

const SHORT_MAX = 400;
const SLUG_MAX = 80;

const PERSIAN_LETTERS: Record<string, string> = {
  آ: "a",
  ا: "a",
  أ: "a",
  إ: "a",
  ؤ: "v",
  ئ: "y",
  ء: "",
  ب: "b",
  پ: "p",
  ت: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "z",
  ر: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "gh",
  ک: "k",
  ك: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "v",
  ه: "h",
  ة: "h",
  ی: "y",
  ي: "y",
  ى: "y",
  "‌": "-",
  "ـ": "",
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export type DesignAutoKey =
  | "slug"
  | "titleEn"
  | "description"
  | "shortDescription"
  | "seoTitle"
  | "seoDescription"
  | "alt"
  | "ogImage"
  | "thumbnailPath"
  | "templateSlug";

export type DesignAutoFlags = Record<DesignAutoKey, boolean>;

export type DesignAutoSource = {
  title: string;
  titleEn: string;
  slug: string;
  templateSlug: string;
  imagePath: string;
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  alt: string;
  ogImage: string;
  thumbnailPath: string;
  categoryName?: string;
  tags: string[];
};

export type DesignAutoValues = Record<DesignAutoKey, string>;

export function emptyDesignAutoFlags(): DesignAutoFlags {
  return {
    slug: false,
    titleEn: false,
    description: false,
    shortDescription: false,
    seoTitle: false,
    seoDescription: false,
    alt: false,
    ogImage: false,
    thumbnailPath: false,
    templateSlug: false,
  };
}

export function clipDesignText(value: string, max = SHORT_MAX): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd();
}

function slugifyLatin(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function transliterate(value: string): string {
  let latin = "";
  for (const char of value.normalize("NFC")) {
    if (PERSIAN_LETTERS[char] !== undefined) {
      latin += PERSIAN_LETTERS[char];
      continue;
    }
    const persianDigit = PERSIAN_DIGITS.indexOf(char);
    if (persianDigit >= 0) {
      latin += String(persianDigit);
      continue;
    }
    const arabicDigit = ARABIC_DIGITS.indexOf(char);
    if (arabicDigit >= 0) {
      latin += String(arabicDigit);
      continue;
    }
    if (/[\u064B-\u0652]/.test(char)) continue;
    latin += /[a-zA-Z0-9]/.test(char) ? char.toLowerCase() : "-";
  }
  return slugifyLatin(latin);
}

function usableSlug(value: string): string {
  return /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(value) ? value : "";
}

function limitSlug(value: string): string {
  const cleaned = usableSlug(value.replace(/^-+|-+$/g, ""));
  if (!cleaned) return "design";
  if (cleaned.length <= SLUG_MAX) return cleaned;
  const sliced = cleaned.slice(0, SLUG_MAX).replace(/-+$/, "");
  const hyphen = sliced.lastIndexOf("-");
  const candidate = (hyphen >= 12 ? sliced.slice(0, hyphen) : sliced).replace(/-+$/, "");
  return usableSlug(candidate) || "design";
}

export function designSlugBase(input: {
  title: string;
  titleEn: string;
  templateSlug?: string;
}): string {
  const fromEnglish = usableSlug(slugifyLatin(input.titleEn));
  if (fromEnglish) return limitSlug(fromEnglish);

  const title = input.title.trim();
  if (title && isFilenameDesignTitle(title)) {
    const fromTitle = usableSlug(slugifyLatin(title));
    if (fromTitle) return limitSlug(fromTitle);
  }

  if (title) {
    const fromPersian = usableSlug(transliterate(title));
    if (fromPersian) return limitSlug(fromPersian);
  }

  const fromTemplate = usableSlug(slugifyLatin(input.templateSlug ?? ""));
  if (fromTemplate) return limitSlug(fromTemplate);
  return "design";
}

export function suggestedTitleEn(title: string): string {
  const trimmed = title.trim();
  return trimmed && isFilenameDesignTitle(trimmed) ? trimmed : "";
}

export function suggestedDesignDescription(title: string): string {
  const name = title.trim();
  if (!name) return "";
  return designPublicDescription({
    title: name,
    slug: "design",
    category: "",
    tags: [],
    description: "",
  });
}

export function isGeneratedValue(stored: string, suggestion: string): boolean {
  const value = stored.trim();
  return value === "" || value === suggestion.trim();
}

function shortIsGenerated(stored: string, description: string): boolean {
  const value = stored.trim();
  const full = description.trim();
  return value === "" || value === full || value === clipDesignText(full);
}

function pathIsGenerated(stored: string, imagePath: string): boolean {
  const value = stored.trim();
  return value === "" || value === imagePath.trim();
}

export function autoFlagsForDesign(
  design: Omit<DesignAutoSource, "categoryName">,
  categoryName?: string,
): DesignAutoFlags {
  const flags = emptyDesignAutoFlags();
  flags.slug = true;

  const descriptionSuggestion = suggestedDesignDescription(design.title);
  const descriptionIsCustom = !isGeneratedValue(design.description, descriptionSuggestion);
  const descriptionText = descriptionIsCustom ? design.description : descriptionSuggestion;
  flags.description = descriptionIsCustom;
  flags.shortDescription = !shortIsGenerated(design.shortDescription, descriptionText);
  flags.titleEn = !isGeneratedValue(design.titleEn, suggestedTitleEn(design.title));
  flags.seoTitle = !isGeneratedValue(design.seoTitle, design.title.trim() ? suggestedDesignSeoTitle(design.title) : "");
  flags.seoDescription = !isGeneratedValue(
    design.seoDescription,
    design.title.trim()
      ? suggestedDesignSeoDescription({
          title: design.title,
          slug: design.slug,
          categoryName,
          tags: design.tags,
        })
      : "",
  );
  flags.alt =
    !isGeneratedValue(design.alt, design.title.trim() ? suggestedDesignAlt(design.title) : "") &&
    !isWeakDesignAlt(design.alt, design.title);
  flags.ogImage = !pathIsGenerated(design.ogImage, design.imagePath);
  flags.thumbnailPath = !pathIsGenerated(design.thumbnailPath, design.imagePath);
  flags.templateSlug = !isGeneratedValue(design.templateSlug, design.slug);
  return flags;
}

export function resolveDesignAutos(source: DesignAutoSource, flags: DesignAutoFlags): DesignAutoValues {
  const title = source.title.trim();
  const titleEn = flags.titleEn ? source.titleEn.trim() : suggestedTitleEn(title);
  const slug = flags.slug
    ? source.slug.trim()
    : designSlugBase({
        title,
        titleEn,
        templateSlug: source.templateSlug,
      });
  const description = flags.description ? source.description.trim() : suggestedDesignDescription(title);
  const image = source.imagePath.trim();

  return {
    slug,
    titleEn,
    description,
    shortDescription: flags.shortDescription ? source.shortDescription.trim() : clipDesignText(description),
    seoTitle: flags.seoTitle ? source.seoTitle.trim() : title ? suggestedDesignSeoTitle(title) : "",
    seoDescription: flags.seoDescription
      ? source.seoDescription.trim()
      : title
        ? suggestedDesignSeoDescription({
            title,
            slug: slug || "design",
            categoryName: source.categoryName,
            tags: source.tags,
          })
        : "",
    alt: flags.alt ? source.alt.trim() : title ? suggestedDesignAlt(title) : "",
    ogImage: flags.ogImage ? source.ogImage.trim() : image,
    thumbnailPath: flags.thumbnailPath ? source.thumbnailPath.trim() : image,
    templateSlug: flags.templateSlug ? source.templateSlug.trim() : slug,
  };
}

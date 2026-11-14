import { SITE_BRAND } from "../seo/site";

const TITLE_MAX = 60;
const DESCRIPTION_MIN = 140;
const DESCRIPTION_MAX = 160;

const DESIGN_TITLE_SUFFIX = " برای قاب موبایل";

function clip(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1).trimEnd();
  return `${sliced}…`;
}

function variantIndex(seed: string, count: number): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return hash % count;
}

function compactLabel(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function clipAtWord(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  const sliced = trimmed.slice(0, max);
  const space = sliced.lastIndexOf(" ");
  if (space >= 8) return sliced.slice(0, space).trim();
  return sliced.trim();
}

/** Keeps Persian SEO descriptions inside a normal Google snippet length. */
export function fitSeoDescription(lead: string, extras: string[]): string {
  let text = clipAtWord(lead.replace(/\s+/g, " ").trim(), DESCRIPTION_MAX);

  for (const extra of extras) {
    if (text.length >= DESCRIPTION_MIN) break;
    const addition = extra.replace(/\s+/g, " ").trim();
    if (!addition) continue;
    const next = `${text} ${addition}`.trim();
    if (next.length <= DESCRIPTION_MAX) {
      text = next;
      continue;
    }
    const room = DESCRIPTION_MAX - text.length - 1;
    if (room > 8 && text.length < DESCRIPTION_MIN) {
      const cut = addition.slice(0, room);
      const space = cut.lastIndexOf(" ");
      const partial = (space > 0 ? cut.slice(0, space) : "").trim();
      if (partial) text = `${text} ${partial}`.trim();
    }
    break;
  }

  return clipAtWord(text, DESCRIPTION_MAX);
}

export function suggestedDesignSeoTitle(title: string): string {
  const name = title.replace(/\s+/g, " ").trim() || "طرح قاب";
  const body = name.startsWith("طرح ") ? name : `طرح ${name}`;
  if (body.endsWith("قاب موبایل") || body.includes(" برای قاب موبایل")) {
    return clip(body, TITLE_MAX);
  }
  const room = TITLE_MAX - DESIGN_TITLE_SUFFIX.length;
  const head = body.length <= room ? body : `${body.slice(0, room - 1).trimEnd()}…`;
  return `${head}${DESIGN_TITLE_SUFFIX}`;
}

export function suggestedDesignSeoDescription(input: {
  title: string;
  slug: string;
  categoryName?: string;
  tags?: string[];
}): string {
  const rawLabel = compactLabel(input.title.trim() || "طرح قاب", 42);
  const label = rawLabel.replace(/^طرح\s+/, "");
  const category = input.categoryName?.trim() || "طرح‌های آماده";
  const tag = input.tags?.map((item) => item.trim()).find((item) => item && item !== "طراحی آماده" && item !== "سایر");
  const leads = [
    `طرح ${label} از دسته ${category} برای چاپ روی قاب موبایل در ${SITE_BRAND}. قابل سفارش برای آیفون و اندروید.`,
    `قاب موبایل با طرح ${label} (${category}) در ${SITE_BRAND}. طرح آماده با پیش‌نمایش و ارسال به سراسر ایران.`,
    `در ${SITE_BRAND} طرح ${label} از دسته ${category} را روی قاب گوشی چاپ و به ایران ارسال کنید.`,
    `طرح آماده ${label} برای قاب موبایل در دسته ${category}. چاپ اختصاصی و ارسال سراسری از ${SITE_BRAND}.`,
  ];
  const extras = [
    "انتخاب مدل گوشی در همان صفحه.",
    tag ? `سبک طرح: ${tag}.` : "قابل ویرایش قبل از چاپ.",
    "مناسب هدیه و استفاده روزمره.",
    "پیش‌نمایش چاپ قبل از تولید.",
  ];
  const index = variantIndex(input.slug || label, leads.length);
  const orderedExtras = extras.slice(index).concat(extras.slice(0, index));
  return fitSeoDescription(leads[index] ?? leads[0], orderedExtras);
}

export function suggestedDesignAlt(title: string): string {
  const name = title.replace(/\s+/g, " ").trim() || "طرح قاب";
  const cleaned = name.replace(/^طرح\s+قاب\s+/i, "").replace(/^طرح\s+/i, "").trim() || name;
  return clip(`طرح قاب موبایل ${cleaned} — ${SITE_BRAND}`, 180);
}

export function isWeakDesignAlt(alt: string, title: string): boolean {
  const current = alt.trim();
  return !current || current === title.trim();
}

function categoryThemeLabel(name: string): string {
  const label = name.replace(/\s+/g, " ").trim() || "آماده";
  return label.replace(/^طرح\s+/i, "").trim() || label;
}

export function suggestedCategorySeoTitle(name: string, parentName?: string): string {
  const theme = categoryThemeLabel(name);
  if (parentName?.trim()) {
    return clip(`خرید قاب موبایل طرح ${theme}`, TITLE_MAX);
  }
  return clip(`خرید قاب موبایل طرح ${theme}`, TITLE_MAX);
}

export function suggestedCategorySeoDescription(name: string, slug: string, parentName?: string): string {
  const theme = compactLabel(categoryThemeLabel(name), 28);
  const parent = parentName?.trim();
  const place = parent ? `در دسته ${parent}` : "از طرح‌های آماده";
  const leads = [
    `خرید قاب موبایل طرح ${theme} ${place} در ${SITE_BRAND}. چاپ روی قاب گوشی با پیش‌نمایش و ارسال به سراسر ایران.`,
    `قاب موبایل طرح ${theme} ${place}. در ${SITE_BRAND} طرح آماده را انتخاب کنید یا قاب اختصاصی بسازید.`,
    `${place}: خرید قاب موبایل طرح ${theme} با چاپ باکیفیت در ${SITE_BRAND} و ارسال سراسری در ایران.`,
  ];
  const extras = [
    "مناسب آیفون، سامسونگ، شیائومی و هواوی.",
    "انتخاب مدل گوشی و ثبت سفارش آنلاین.",
    "طرح آماده و طراحی اختصاصی در یک فروشگاه.",
  ];
  const index = variantIndex(slug || theme, leads.length);
  const orderedExtras = extras.slice(index).concat(extras.slice(0, index));
  return fitSeoDescription(leads[index] ?? leads[0], orderedExtras);
}

export function suggestedFilterSeoTitle(groupSlug: string, name: string): string {
  const label = name.replace(/\s+/g, " ").trim() || "طرح";
  if (groupSlug === "colors") return clip(`خرید قاب موبایل ${label}`, TITLE_MAX);
  if (groupSlug === "visual-styles") return clip(`خرید قاب گوشی طرح ${label}`, TITLE_MAX);
  return clip(`قاب موبایل ${label}`, TITLE_MAX);
}

export function suggestedFilterSeoDescription(groupSlug: string, name: string, slug: string): string {
  const label = compactLabel(name.trim() || "طرح", 24);
  const leads =
    groupSlug === "colors"
      ? [
          `خرید قاب موبایل ${label} در ${SITE_BRAND}. این رنگ برای قاب گوشی با چاپ آماده و ارسال به سراسر ایران در دسترس است.`,
          `${SITE_BRAND} خرید قاب موبایل ${label} را با چاپ روی قاب گوشی و ارسال به سراسر ایران انجام می‌دهد.`,
          `قاب گوشی ${label} برای خرید قاب موبایل در ${SITE_BRAND}، با پیش‌نمایش چاپ و ارسال سراسری.`,
        ]
      : groupSlug === "visual-styles"
        ? [
            `خرید قاب موبایل با طرح ${label} در ${SITE_BRAND}. این سبک روی قاب گوشی چاپ می‌شود و به سراسر ایران ارسال می‌گردد.`,
            `${SITE_BRAND} خرید قاب موبایل طرح ${label} را برای قاب گوشی با چاپ آماده و ارسال سراسری عرضه می‌کند.`,
            `قاب گوشی طرح ${label} در ${SITE_BRAND}. خرید قاب موبایل با این سبک، پیش‌نمایش و ارسال به ایران.`,
          ]
        : [
            `قاب موبایل ${label} برای خرید قاب موبایل در ${SITE_BRAND}. این ویژگی روی قاب گوشی چاپ می‌شود و به سراسر ایران می‌رسد.`,
            `خرید قاب موبایل با ویژگی ${label} در ${SITE_BRAND}. چاپ آن روی قاب گوشی و ارسال سراسری ممکن است.`,
            `${SITE_BRAND} خرید قاب موبایل ${label} را برای قاب گوشی آماده کرده و به سراسر ایران می‌فرستد.`,
          ];
  const extras = [
    "انتخاب مدل گوشی و ثبت سفارش آنلاین.",
    "مناسب آیفون، سامسونگ و شیائومی.",
    "پیش‌نمایش طرح قبل از چاپ.",
  ];
  const index = variantIndex(`filter:${groupSlug}:${slug || label}`, leads.length);
  const orderedExtras = extras.slice(index).concat(extras.slice(0, index));
  return fitSeoDescription(leads[index] ?? leads[0], orderedExtras);
}

const COLLECTION_TITLE_MAP: Record<string, string> = {
  rare: "خرید قاب خاص",
  "shopghab-exclusive": "طرح اختصاصی قاب موبایل",
  bestsellers: "پرفروش‌ترین قاب موبایل",
  popular: "پرطرفدارترین قاب موبایل",
  newest: "جدیدترین طرح قاب موبایل",
  "staff-picks": "منتخب قاب موبایل شاپ قاب",
  "gift-boy": "قاب موبایل هدیه پسرانه",
  "gift-friend": "قاب موبایل هدیه دوستانه",
  "gift-girl": "قاب موبایل هدیه دخترانه",
  occasion: "قاب موبایل مناسبتی",
  seasonal: "قاب موبایل فصلی",
  artists: "قاب موبایل هنری",
  limited: "قاب موبایل محدود",
};

export function suggestedCollectionSeoTitle(name: string, slug = ""): string {
  const mapped = COLLECTION_TITLE_MAP[slug];
  if (mapped) return clip(mapped, TITLE_MAX);
  const theme = categoryThemeLabel(name);
  if (/هدیه|gift/i.test(slug) || /هدیه/.test(theme)) {
    return clip(`خرید قاب موبایل هدیه ${theme.replace(/^هدیه\s*/u, "")}`.trim(), TITLE_MAX);
  }
  return clip(`خرید قاب موبایل ${theme}`, TITLE_MAX);
}

export function suggestedCollectionSeoDescription(name: string, slug: string): string {
  const label = compactLabel(categoryThemeLabel(name), 28);
  const leads = [
    `کالکشن ${label} برای خرید قاب موبایل در ${SITE_BRAND}. طرح آماده با چاپ باکیفیت و ارسال به سراسر ایران.`,
    `در ${SITE_BRAND} کالکشن ${label} را برای قاب گوشی ببینید؛ طرح آماده یا طراحی اختصاصی با پیش‌نمایش چاپ.`,
    `فروش قاب موبایل از کالکشن ${label} در ${SITE_BRAND}، مناسب هدیه و استفاده روزمره روی آیفون و اندروید.`,
  ];
  const extras = [
    "انتخاب مدل گوشی و ثبت سفارش آنلاین.",
    "پیش‌نمایش طرح قبل از چاپ.",
    "ارسال سراسری در ایران.",
  ];
  const index = variantIndex(`collection:${slug || label}`, leads.length);
  const orderedExtras = extras.slice(index).concat(extras.slice(0, index));
  return fitSeoDescription(leads[index] ?? leads[0], orderedExtras);
}

/** Visible H1 for category pages — human name, not SERP title. */
export function categoryPageHeading(name: string): string {
  return name.replace(/\s+/g, " ").trim() || "دسته‌بندی طرح‌ها";
}

/** Soft intro fallback when category.description is empty. */
export function suggestedCategoryIntro(name: string, parentName?: string): string {
  const theme = categoryThemeLabel(name);
  const parent = parentName?.trim();
  if (parent) {
    return `طرح‌های ${theme} از دسته ${parent} را برای چاپ روی قاب موبایل ببینید. می‌توانید طرح آماده را انتخاب کنید یا از مسیر طراحی اختصاصی، قاب منحصربه‌فرد خود را بسازید.`;
  }
  return `مجموعه‌ای از طرح‌های ${theme} برای قاب موبایل در ${SITE_BRAND}. طرح آماده را روی مدل گوشی خود اعمال کنید یا قاب اختصاصی طراحی کنید و به سراسر ایران سفارش دهید.`;
}

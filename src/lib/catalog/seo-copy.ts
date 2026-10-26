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
    `فروش قاب موبایل با ${label} در دسته ${category}. چاپ این طرح در ${SITE_BRAND} با ارسال به سراسر ایران.`,
    `${label} برای فروش قاب موبایل از دسته ${category} در ${SITE_BRAND} با چاپ باکیفیت و سفارش آنلاین.`,
    `در ${SITE_BRAND} طرح ${label} از دسته ${category} برای فروش قاب موبایل چاپ و ارسال می‌شود.`,
    `فروش قاب موبایل با طرح ${label}، دسته ${category}، و پیش‌نمایش چاپ در ${SITE_BRAND}.`,
  ];
  const extras = [
    "مناسب آیفون، سامسونگ و شیائومی.",
    tag ? `سبک طرح: ${tag}.` : "طرح آماده برای چاپ روی قاب گوشی.",
    "انتخاب مدل گوشی و ثبت سفارش در همان صفحه.",
    "چاپ اختصاصی با امکان پیش‌نمایش قبل از تولید.",
  ];
  const index = variantIndex(input.slug || label, leads.length);
  const orderedExtras = extras.slice(index).concat(extras.slice(0, index));
  return fitSeoDescription(leads[index] ?? leads[0], orderedExtras);
}

export function suggestedDesignAlt(title: string): string {
  const name = title.replace(/\s+/g, " ").trim() || "طرح قاب";
  return clip(`طرح قاب موبایل ${name} — ${SITE_BRAND}`, 180);
}

export function isWeakDesignAlt(alt: string, title: string): boolean {
  const current = alt.trim();
  return !current || current === title.trim();
}

function categoryLabel(name: string): string {
  const label = name.replace(/\s+/g, " ").trim() || "طرح";
  return /^طرح/.test(label) ? label : `طرح ${label}`;
}

export function suggestedCategorySeoTitle(name: string): string {
  return clip(`خرید قاب موبایل ${categoryLabel(name)}`, TITLE_MAX);
}

export function suggestedCategorySeoDescription(name: string, slug: string, parentName?: string): string {
  const label = compactLabel(name.trim() || "طرح", 36);
  const titled = categoryLabel(label);
  const parent = parentName?.trim();
  const place = parent ? `زیرمجموعه ${parent}` : "بخش طرح‌های آماده";
  const leads = [
    `خرید قاب موبایل با ${titled} (${place}). چاپ روی قاب گوشی در ${SITE_BRAND}، با پیش‌نمایش و ارسال به سراسر ایران.`,
    `در ${SITE_BRAND} خرید قاب موبایل با ${titled} فراهم است. این ${place} روی قاب گوشی چاپ و ارسال می‌شود.`,
    `${place}: خرید قاب موبایل با ${titled}. ${SITE_BRAND} این طرح را برای قاب گوشی آماده کرده و به ایران می‌فرستد.`,
  ];
  const extras = [
    "انتخاب مدل گوشی، پیش‌نمایش طرح و ثبت سفارش آنلاین.",
    "مناسب آیفون، سامسونگ، شیائومی و هواوی.",
    "طرح آماده با امکان سفارش در همان صفحه.",
  ];
  const index = variantIndex(slug || label, leads.length);
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

export function suggestedCollectionSeoTitle(name: string, slug = ""): string {
  if (slug === "rare") return "خرید قاب خاص";
  if (slug === "shopghab-exclusive") return "طرح اختصاصی قاب موبایل";
  return suggestedCategorySeoTitle(name);
}

export function suggestedCollectionSeoDescription(name: string, slug: string): string {
  const label = compactLabel(name.trim() || "منتخب", 36);
  const leads = [
    `فروش قاب موبایل از کالکشن ${label} در ${SITE_BRAND}. طرح‌های منتخب با چاپ باکیفیت و ارسال سراسری.`,
    `کالکشن ${label} برای فروش قاب موبایل در ${SITE_BRAND}، با طرح آماده و امکان سفارش آنلاین.`,
    `${SITE_BRAND} کالکشن ${label} را برای فروش قاب موبایل و چاپ طرح روی قاب گوشی گردآوری کرده است.`,
  ];
  const extras = [
    "مناسب هدیه و استفاده روزمره روی آیفون و سامسونگ.",
    "هر طرح قابل پیش‌نمایش قبل از چاپ است.",
    "انتخاب مدل گوشی و ثبت سفارش در همان فروشگاه.",
  ];
  const index = variantIndex(`collection:${slug || label}`, leads.length);
  const orderedExtras = extras.slice(index).concat(extras.slice(0, index));
  return fitSeoDescription(leads[index] ?? leads[0], orderedExtras);
}

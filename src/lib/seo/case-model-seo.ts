import {
  getBrandBySlug,
  getModelBySlug,
  CASE_TYPES,
} from "@/lib/cases/brands.static";
import type { PhoneBrand, PhoneModel } from "@/lib/cases/types";
import { breadcrumbJsonLd } from "./breadcrumbs";
import { faqPageJsonLd, itemListJsonLd, webPageJsonLd } from "./jsonld";
import { DEFAULT_OG_IMAGE, SITE_BRAND } from "./site";

export type ModelSeoContext = {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogImage?: string;
  brand: PhoneBrand;
  model: PhoneModel;
};

export function buildModelCanonicalPath(brandSlug: string, modelSlug: string): string {
  return `/phones/${brandSlug}/${modelSlug}`;
}

export function resolveModelSeo(
  brandSlug: string,
  modelSlug: string,
): ModelSeoContext | null {
  const brand = getBrandBySlug(brandSlug);
  const model = getModelBySlug(brandSlug, modelSlug);
  if (!brand || !model) return null;

  const canonicalPath = buildModelCanonicalPath(brandSlug, modelSlug);
  const title = `فروش قاب ${model.name}`;
  const caseTypeNames = CASE_TYPES.map((item) => item.name).join("، ");
  const description = `فروش قاب موبایل ${model.name} (${brand.name}) در ${SITE_BRAND} (shopghab). قاب آماده یا طراحی اختصاصی با متن و استیکر، ${CASE_TYPES.length} نوع قاب (${caseTypeNames}). چاپ با کیفیت و ارسال سریع به سراسر ایران.`;

  return {
    title,
    description,
    keywords: [
      `فروش قاب ${model.name}`,
      `فروش قاب ${brand.name}`,
      "shopghab",
      SITE_BRAND,
      "فروش قاب موبایل",
      `قاب ${model.name}`,
      `قاب ${brand.name}`,
      `طراحی قاب ${model.name}`,
      `قاب ${model.nameEn}`,
    ],
    canonicalPath,
    ogImage: model.image || DEFAULT_OG_IMAGE,
    brand,
    model,
  };
}

const MODEL_FAQ = [
  {
    question: "چه نوع قاب‌هایی برای این مدل موجود است؟",
    answer:
      "شاپ قاب برای فروش قاب موبایل این مدل قاب شفاف، مات، شیشه‌ای، سیلیکونی و چرمی دارد و روی هر نوع چاپ اختصاصی ممکن است.",
  },
  {
    question: "آیا می‌توانم قاب را خودم طراحی کنم؟",
    answer:
      "بله. در شاپ قاب نوع قاب را انتخاب کنید، سپس متن، استیکر و تصویر اضافه کنید و پیش‌نمایش ببینید.",
  },
  {
    question: "زمان ارسال چقدر است؟",
    answer:
      "پس از تأیید طراحی و چاپ، فروش قاب موبایل در کوتاه‌ترین زمان به سراسر ایران ارسال می‌شود.",
  },
  {
    question: "آیا ضمانت بازگشت دارید؟",
    answer: "بله. شاپ قاب ۷ روز ضمانت بازگشت برای قاب‌های سفارشی و آماده دارد.",
  },
];

export function modelPageJsonLd(
  ctx: ModelSeoContext,
  templates: { title: string; slug: string }[],
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [
    webPageJsonLd({
      name: ctx.title,
      description: ctx.description,
      path: ctx.canonicalPath,
    }),
    breadcrumbJsonLd(
      [
        { label: "خانه", href: "/" },
        { label: "قاب موبایل", href: "/create" },
        { label: ctx.brand.name, href: `/create/${ctx.brand.slug}` },
        { label: ctx.model.name },
      ],
      ctx.canonicalPath,
    ),
    faqPageJsonLd(MODEL_FAQ),
  ];

  if (templates.length > 0) {
    schemas.push(
      itemListJsonLd({
        name: `طراحی‌های آماده ${ctx.model.name}`,
        path: ctx.canonicalPath,
        items: templates.map((t) => ({
          name: t.title,
          url: `/designs/${t.slug}`,
        })),
      }),
    );
  }

  return schemas;
}

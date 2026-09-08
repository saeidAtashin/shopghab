import {
  getBrandBySlug,
  getModelBySlug,
  CASE_TYPES,
} from "@/lib/cases/brands.static";
import type { PhoneBrand, PhoneModel } from "@/lib/cases/types";
import type { CaseTemplate } from "@/lib/design/types";
import { breadcrumbJsonLd } from "./breadcrumbs";
import { faqPageJsonLd, itemListJsonLd, webPageJsonLd } from "./jsonld";
import { DEFAULT_OG_IMAGE } from "./site";

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
  const title = `قاب ${model.name} — طراحی اختصاصی و آماده`;
  const description = `خرید و طراحی قاب ${model.name} (${brand.name}) — قاب‌های آماده یا طراحی اختصاصی با متن و استیکر. ${CASE_TYPES.length} نوع قاب (${CASE_TYPES.map((c) => c.name).join("، ")}). چاپ با کیفیت و ارسال سریع به سراسر ایران.`;

  return {
    title,
    description,
    keywords: [
      `قاب ${model.name}`,
      `قاب ${brand.name}`,
      `طراحی قاب ${model.name}`,
      `خرید قاب ${model.nameEn}`,
      `قاب ${model.nameEn}`,
      "قاب موبایل",
      "طراحی قاب",
      "قاب سفارشی",
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
      "قاب شفاف، مات، شیشه‌ای، سیلیکونی و چرمی — هر کدام با قیمت و امکان چاپ اختصاصی.",
  },
  {
    question: "آیا می‌توانم قاب را خودم طراحی کنم؟",
    answer:
      "بله. نوع قاب را انتخاب کنید، سپس در ویرایشگر متن، استیکر و تصویر اضافه کنید و پیش‌نمایش ببینید.",
  },
  {
    question: "زمان ارسال چقدر است؟",
    answer:
      "پس از تأیید طراحی و چاپ، سفارش در کوتاه‌ترین زمان به سراسر ایران ارسال می‌شود.",
  },
  {
    question: "آیا ضمانت بازگشت دارید؟",
    answer: "بله — ۷ روز ضمانت بازگشت برای قاب‌های سفارشی و آماده.",
  },
];

export function modelPageJsonLd(
  ctx: ModelSeoContext,
  templates: CaseTemplate[],
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

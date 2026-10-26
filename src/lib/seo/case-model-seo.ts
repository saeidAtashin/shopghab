import {
  getBrandBySlug,
  getModelBySlug,
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
  const title = `خرید قاب ${model.name}`;
  const description = `خرید قاب ${model.name} (${brand.name}) در ${SITE_BRAND}. قاب گوشی و قاب موبایل ${model.name}، قاب اختصاصی یا قاب تلفن همراه، با چاپ باکیفیت و ارسال به سراسر ایران.`;

  return {
    title,
    description,
    keywords: [
      `خرید قاب ${model.name}`,
      `قاب گوشی ${model.name}`,
      `قاب موبایل ${brand.name} ${model.name}`,
      `قاب اختصاصی ${model.name}`,
      `قاب تلفن همراه ${model.name}`,
      `خرید قاب ${brand.name}`,
      `قاب ${model.nameEn}`,
      "خرید قاب موبایل",
      SITE_BRAND,
      "shopghab",
    ],
    canonicalPath,
    ogImage: model.image || DEFAULT_OG_IMAGE,
    brand,
    model,
  };
}

export type ModelFaqItem = { question: string; answer: string };

export function modelPurchaseFaq(brandName: string, modelName: string): ModelFaqItem[] {
  return [
    {
      question: `خرید قاب اختصاصی ${modelName} چطور انجام می‌شود؟`,
      answer: `در ${SITE_BRAND} مدل ${modelName} از ${brandName} را انتخاب کنید، متن یا تصویر را اضافه کنید و قاب اختصاصی را برای چاپ سفارش دهید.`,
    },
    {
      question: `آیا قاب گوشی ${modelName} آماده هم دارید؟`,
      answer: `بله. کنار طراحی اختصاصی، قاب موبایل و قاب تلفن همراه ${modelName} با طرح آماده هم قابل سفارش است.`,
    },
    {
      question: "زمان ارسال چقدر است؟",
      answer: `پس از تأیید طرح، خرید قاب ${modelName} چاپ و به سراسر ایران ارسال می‌شود.`,
    },
    {
      question: "آیا ضمانت بازگشت دارید؟",
      answer: `بله. ${SITE_BRAND} ۷ روز ضمانت بازگشت برای قاب اختصاصی و قاب آماده دارد.`,
    },
  ];
}

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
    faqPageJsonLd(modelPurchaseFaq(ctx.brand.name, ctx.model.name)),
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

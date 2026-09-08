import { APPLE_PHONE_MODELS } from "./apple/models";
import { GENERIC_CUSTOM_MODEL, OTHER_BRAND } from "./generic-model";
import { HUAWEI_PHONE_MODELS } from "./huawei/models";
import { SAMSUNG_PHONE_MODELS } from "./samsung/models";
import { XIAOMI_PHONE_MODELS } from "./xiaomi/models";
import type { CaseType, PhoneBrand, PhoneModel } from "./types";

export const PHONE_BRANDS: PhoneBrand[] = [
  {
    slug: "apple",
    name: "اپل",
    nameEn: "Apple",
    logo: "/cases/brands/apple.svg",
  },
  {
    slug: "samsung",
    name: "سامسونگ",
    nameEn: "Samsung",
    logo: "/cases/brands/samsung.svg",
  },
  {
    slug: "xiaomi",
    name: "شیائومی",
    nameEn: "Xiaomi",
    logo: "/cases/brands/xiaomi.svg",
  },
  {
    slug: "huawei",
    name: "هواوی",
    nameEn: "Huawei",
    logo: "/cases/brands/huawei.svg",
  },
  OTHER_BRAND,
];

export const PHONE_MODELS: PhoneModel[] = [
  ...APPLE_PHONE_MODELS,
  ...SAMSUNG_PHONE_MODELS,
  ...XIAOMI_PHONE_MODELS,
  ...HUAWEI_PHONE_MODELS,
  GENERIC_CUSTOM_MODEL,
];

export const CASE_TYPES: CaseType[] = [
  {
    slug: "clear",
    name: "قاب شفاف",
    description: "نمایش کامل رنگ گوشی با محافظت ضد ضربه",
    price: 890_000,
    customizationFee: 150_000,
    color: "#e8f4fc",
    material: "clear",
  },
  {
    slug: "matte",
    name: "قاب مات",
    description: "سطح مات ضد لغزش، مناسب چاپ اختصاصی",
    price: 950_000,
    customizationFee: 150_000,
    color: "#2a2a2e",
    material: "matte",
  },
  {
    slug: "glass",
    name: "قاب شیشه‌ای",
    description: "پوشش شیشه‌ای براق با لبه سیلیکونی",
    price: 1_050_000,
    customizationFee: 180_000,
    color: "#1a1a2e",
    material: "glass",
  },
  {
    slug: "silicone",
    name: "قاب سیلیکونی",
    description: "نرم و انعطاف‌پذیر، محافظت عالی",
    price: 750_000,
    customizationFee: 120_000,
    color: "#3b3b45",
    material: "silicone",
  },
  {
    slug: "leather",
    name: "قاب چرمی",
    description: "چرم مصنوعی با بافت لوکس",
    price: 1_200_000,
    customizationFee: 200_000,
    color: "#4a3728",
    material: "leather",
  },
];

export function getBrandBySlug(slug: string): PhoneBrand | undefined {
  return PHONE_BRANDS.find((b) => b.slug === slug);
}

export function getModelsByBrand(brandSlug: string): PhoneModel[] {
  return PHONE_MODELS.filter((m) => m.brandSlug === brandSlug);
}

export function getModelsByBrandAndSeries(brandSlug: string, seriesSlug?: string): PhoneModel[] {
  const models = getModelsByBrand(brandSlug);
  if (!seriesSlug) return models;
  return models.filter((m) => m.seriesSlug === seriesSlug);
}

export function getModelBySlug(brandSlug: string, modelSlug: string): PhoneModel | undefined {
  return PHONE_MODELS.find(
    (m) => m.brandSlug === brandSlug && m.slug === modelSlug,
  );
}

export function getCaseTypeBySlug(slug: string): CaseType | undefined {
  return CASE_TYPES.find((c) => c.slug === slug);
}

export function getCaseTotalPrice(caseType: CaseType, customized: boolean): number {
  return caseType.price + (customized ? caseType.customizationFee : 0);
}

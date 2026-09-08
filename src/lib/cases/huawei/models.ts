import { buildPhoneModel } from "../phone-back";
import type { PhoneModel } from "../types";
import { getChassisTemplate, resolveChassisTemplate } from "./chassis-templates";

function huaweiModel(
  slug: string,
  seriesSlug: string,
  name: string,
  nameEn: string,
  widthMm: number,
  heightMm: number,
  templateSlug: string,
  baseCanvasWidth?: number,
): PhoneModel {
  const template = getChassisTemplate(templateSlug);
  return buildPhoneModel({
    slug,
    brandSlug: "huawei",
    seriesSlug,
    name,
    nameEn,
    widthMm,
    heightMm,
    back: resolveChassisTemplate(template, widthMm, heightMm),
    baseCanvasWidth,
  });
}

export const HUAWEI_PHONE_MODELS: PhoneModel[] = [
  // Pura 70
  huaweiModel("pura-70-ultra", "pura", "پورا ۷۰ اولترا", "Pura 70 Ultra", 75.5, 162.6, "huawei-pura-circle"),
  huaweiModel("pura-70-pro-plus", "pura", "پورا ۷۰ Pro+", "Pura 70 Pro+", 75.5, 162.6, "huawei-pura-circle"),
  huaweiModel("pura-70-pro", "pura", "پورا ۷۰ Pro", "Pura 70 Pro", 75.5, 162.6, "huawei-pura-circle"),
  huaweiModel("pura-70", "pura", "پورا ۷۰", "Pura 70", 74.3, 157.6, "huawei-pura-circle"),

  // Mate 70
  huaweiModel("mate-70-pro-plus", "mate", "میت ۷۰ Pro+", "Mate 70 Pro+", 75.8, 162.4, "huawei-mate-circle"),
  huaweiModel("mate-70-pro", "mate", "میت ۷۰ Pro", "Mate 70 Pro", 75.8, 162.4, "huawei-mate-circle"),
  huaweiModel("mate-70", "mate", "میت ۷۰", "Mate 70", 75.8, 162.4, "huawei-mate-circle"),

  // Mate 60
  huaweiModel("mate-60-rs", "mate", "میت ۶۰ RS", "Mate 60 RS", 79.0, 163.6, "huawei-mate-circle"),
  huaweiModel("mate-60-pro-plus", "mate", "میت ۶۰ Pro+", "Mate 60 Pro+", 79.0, 163.6, "huawei-mate-circle"),
  huaweiModel("mate-60-pro", "mate", "میت ۶۰ Pro", "Mate 60 Pro", 79.0, 163.6, "huawei-mate-circle"),
  huaweiModel("mate-60", "mate", "میت ۶۰", "Mate 60", 76.0, 161.1, "huawei-mate-circle"),

  // P Series
  huaweiModel("p60-art", "p-series", "P60 Art", "P60 Art", 74.8, 161.0, "huawei-p60-island"),
  huaweiModel("p60-pro", "p-series", "P60 Pro", "P60 Pro", 74.8, 161.0, "huawei-p60-island"),
  huaweiModel("p60", "p-series", "P60", "P60", 74.8, 161.0, "huawei-p60-island"),
  huaweiModel("p50-pro", "p-series", "P50 Pro", "P50 Pro", 72.8, 158.8, "huawei-p50-dual-circle"),
  huaweiModel("p50", "p-series", "P50", "P50", 73.2, 156.9, "huawei-p50-dual-circle"),

  // nova 13
  huaweiModel("nova-13-pro", "nova", "نوا ۱۳ Pro", "nova 13 Pro", 74.9, 161.4, "huawei-nova-triple"),
  huaweiModel("nova-13", "nova", "نوا ۱۳", "nova 13", 74.9, 161.4, "huawei-nova-dual"),

  // nova 12
  huaweiModel("nova-12-ultra", "nova", "نوا ۱۲ Ultra", "nova 12 Ultra", 75.0, 162.6, "huawei-nova-triple"),
  huaweiModel("nova-12-pro", "nova", "نوا ۱۲ Pro", "nova 12 Pro", 75.0, 162.6, "huawei-nova-triple"),
  huaweiModel("nova-12", "nova", "نوا ۱۲", "nova 12", 75.0, 162.6, "huawei-nova-dual"),
  huaweiModel("nova-12-lite", "nova", "نوا ۱۲ Lite", "nova 12 Lite", 74.6, 161.0, "huawei-nova-dual"),
  huaweiModel("nova-12-se", "nova", "نوا ۱۲ SE", "nova 12 SE", 74.6, 161.0, "huawei-nova-dual"),

  // nova 11
  huaweiModel("nova-11-pro", "nova", "نوا ۱۱ Pro", "nova 11 Pro", 74.0, 161.3, "huawei-nova-triple"),
  huaweiModel("nova-11", "nova", "نوا ۱۱", "nova 11", 74.0, 161.3, "huawei-nova-dual"),
  huaweiModel("nova-11-se", "nova", "نوا ۱۱ SE", "nova 11 SE", 74.9, 161.7, "huawei-nova-dual"),

  // Enjoy
  huaweiModel("enjoy-70", "enjoy", "انجوی ۷۰", "Enjoy 70", 77.1, 168.3, "huawei-enjoy-dual"),
  huaweiModel("enjoy-60", "enjoy", "انجوی ۶۰", "Enjoy 60", 77.8, 168.3, "huawei-enjoy-dual"),
  huaweiModel("enjoy-50", "enjoy", "انجوی ۵۰", "Enjoy 50", 77.8, 168.3, "huawei-enjoy-dual"),
  huaweiModel("enjoy-20", "enjoy", "انجوی ۲۰", "Enjoy 20", 76.0, 164.0, "huawei-enjoy-dual"),
];

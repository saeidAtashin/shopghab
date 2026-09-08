import { buildPhoneModel } from "../phone-back";
import type { PhoneModel } from "../types";
import { getChassisTemplate, resolveChassisTemplate } from "./chassis-templates";

function samsungModel(
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
    brandSlug: "samsung",
    seriesSlug,
    name,
    nameEn,
    widthMm,
    heightMm,
    back: resolveChassisTemplate(template, widthMm, heightMm),
    baseCanvasWidth,
  });
}

export const SAMSUNG_PHONE_MODELS: PhoneModel[] = [
  // Galaxy S25
  samsungModel("galaxy-s25-ultra", "galaxy-s", "گلکسی S25 Ultra", "Galaxy S25 Ultra", 77.6, 162.8, "galaxy-s-ultra-isolated", 290),
  samsungModel("galaxy-s25-plus", "galaxy-s", "گلکسی S25 Plus", "Galaxy S25 Plus", 75.8, 158.4, "galaxy-s25-base-dual"),
  samsungModel("galaxy-s25", "galaxy-s", "گلکسی S25", "Galaxy S25", 70.5, 146.9, "galaxy-s25-base-dual"),
  samsungModel("galaxy-s25-fe", "galaxy-s", "گلکسی S25 FE", "Galaxy S25 FE", 76.7, 161.9, "galaxy-s25-base-dual"),

  // Galaxy S24
  samsungModel("galaxy-s24-ultra", "galaxy-s", "گلکسی S24 Ultra", "Galaxy S24 Ultra", 79.0, 162.3, "galaxy-s-ultra-isolated", 290),
  samsungModel("galaxy-s24-plus", "galaxy-s", "گلکسی S24 Plus", "Galaxy S24 Plus", 75.9, 158.5, "galaxy-s-plus-vertical"),
  samsungModel("galaxy-s24", "galaxy-s", "گلکسی S24", "Galaxy S24", 70.6, 147.0, "galaxy-s-base-vertical"),
  samsungModel("galaxy-s24-fe", "galaxy-s", "گلکسی S24 FE", "Galaxy S24 FE", 78.0, 162.0, "galaxy-s-plus-vertical"),

  // Galaxy S23
  samsungModel("galaxy-s23-ultra", "galaxy-s", "گلکسی S23 Ultra", "Galaxy S23 Ultra", 78.1, 163.4, "galaxy-s-ultra-isolated", 290),
  samsungModel("galaxy-s23-plus", "galaxy-s", "گلکسی S23 Plus", "Galaxy S23 Plus", 76.2, 157.8, "galaxy-s-plus-vertical"),
  samsungModel("galaxy-s23", "galaxy-s", "گلکسی S23", "Galaxy S23", 70.9, 146.3, "galaxy-s-base-vertical"),
  samsungModel("galaxy-s23-fe", "galaxy-s", "گلکسی S23 FE", "Galaxy S23 FE", 76.5, 162.0, "galaxy-s-plus-vertical"),

  // Galaxy S22
  samsungModel("galaxy-s22-ultra", "galaxy-s", "گلکسی S22 Ultra", "Galaxy S22 Ultra", 77.9, 163.3, "galaxy-s-ultra-isolated", 290),
  samsungModel("galaxy-s22-plus", "galaxy-s", "گلکسی S22 Plus", "Galaxy S22 Plus", 75.8, 157.4, "galaxy-s-plus-vertical"),
  samsungModel("galaxy-s22", "galaxy-s", "گلکسی S22", "Galaxy S22", 75.6, 146.0, "galaxy-s-base-vertical"),

  // Galaxy S21
  samsungModel("galaxy-s21-ultra", "galaxy-s", "گلکسی S21 Ultra", "Galaxy S21 Ultra", 75.6, 165.1, "galaxy-s-ultra-isolated", 290),
  samsungModel("galaxy-s21-plus", "galaxy-s", "گلکسی S21 Plus", "Galaxy S21 Plus", 75.6, 161.5, "galaxy-s-plus-vertical"),
  samsungModel("galaxy-s21", "galaxy-s", "گلکسی S21", "Galaxy S21", 75.6, 151.7, "galaxy-s-base-vertical"),
  samsungModel("galaxy-s21-fe", "galaxy-s", "گلکسی S21 FE", "Galaxy S21 FE", 74.5, 155.7, "galaxy-s-plus-vertical"),

  // Galaxy A series
  samsungModel("galaxy-a56", "galaxy-a", "گلکسی A56", "Galaxy A56", 77.4, 166.3, "galaxy-a-triple-vertical"),
  samsungModel("galaxy-a55", "galaxy-a", "گلکسی A55", "Galaxy A55", 77.4, 161.1, "galaxy-a-triple-vertical"),
  samsungModel("galaxy-a54", "galaxy-a", "گلکسی A54", "Galaxy A54", 76.7, 158.2, "galaxy-a-triple-vertical", 275),
  samsungModel("galaxy-a53", "galaxy-a", "گلکسی A53", "Galaxy A53", 74.8, 159.6, "galaxy-a-triple-vertical"),
  samsungModel("galaxy-a36", "galaxy-a", "گلکسی A36", "Galaxy A36", 77.6, 161.1, "galaxy-a-triple-vertical"),
  samsungModel("galaxy-a35", "galaxy-a", "گلکسی A35", "Galaxy A35", 78.0, 161.7, "galaxy-a-triple-vertical"),
  samsungModel("galaxy-a34", "galaxy-a", "گلکسی A34", "Galaxy A34", 78.0, 162.1, "galaxy-a-triple-vertical"),
  samsungModel("galaxy-a33", "galaxy-a", "گلکسی A33", "Galaxy A33", 74.0, 159.7, "galaxy-a-triple-vertical"),
  samsungModel("galaxy-a26", "galaxy-a", "گلکسی A26", "Galaxy A26", 77.5, 164.4, "galaxy-a-dual"),
  samsungModel("galaxy-a25", "galaxy-a", "گلکسی A25", "Galaxy A25", 76.6, 161.0, "galaxy-a-dual"),
  samsungModel("galaxy-a16", "galaxy-a", "گلکسی A16", "Galaxy A16", 77.4, 164.4, "galaxy-a-dual"),
  samsungModel("galaxy-a15", "galaxy-a", "گلکسی A15", "Galaxy A15", 76.8, 160.1, "galaxy-a-dual"),

  // Galaxy Z Fold (cover screen back)
  samsungModel("galaxy-z-fold-7", "galaxy-z-fold", "گلکسی Z Fold 7", "Galaxy Z Fold 7", 58.9, 158.4, "galaxy-z-fold-cover", 240),
  samsungModel("galaxy-z-fold-6", "galaxy-z-fold", "گلکسی Z Fold 6", "Galaxy Z Fold 6", 58.9, 153.5, "galaxy-z-fold-cover", 240),
  samsungModel("galaxy-z-fold-5", "galaxy-z-fold", "گلکسی Z Fold 5", "Galaxy Z Fold 5", 58.9, 154.9, "galaxy-z-fold-cover", 240),
  samsungModel("galaxy-z-fold-4", "galaxy-z-fold", "گلکسی Z Fold 4", "Galaxy Z Fold 4", 58.3, 155.1, "galaxy-z-fold-cover", 240),
  samsungModel("galaxy-z-fold-3", "galaxy-z-fold", "گلکسی Z Fold 3", "Galaxy Z Fold 3", 58.1, 158.2, "galaxy-z-fold-cover", 240),

  // Galaxy Z Flip
  samsungModel("galaxy-z-flip-7", "galaxy-z-flip", "گلکسی Z Flip 7", "Galaxy Z Flip 7", 75.2, 172.2, "galaxy-z-flip-dual"),
  samsungModel("galaxy-z-flip-6", "galaxy-z-flip", "گلکسی Z Flip 6", "Galaxy Z Flip 6", 71.9, 165.1, "galaxy-z-flip-dual"),
  samsungModel("galaxy-z-flip-5", "galaxy-z-flip", "گلکسی Z Flip 5", "Galaxy Z Flip 5", 71.9, 165.1, "galaxy-z-flip-dual"),
  samsungModel("galaxy-z-flip-4", "galaxy-z-flip", "گلکسی Z Flip 4", "Galaxy Z Flip 4", 71.2, 165.2, "galaxy-z-flip-dual"),
  samsungModel("galaxy-z-flip-3", "galaxy-z-flip", "گلکسی Z Flip 3", "Galaxy Z Flip 3", 72.2, 166.0, "galaxy-z-flip-dual"),
];

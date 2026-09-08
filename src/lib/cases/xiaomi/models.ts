import { buildPhoneModel } from "../phone-back";
import type { PhoneModel } from "../types";
import { getChassisTemplate, resolveChassisTemplate } from "./chassis-templates";

function xiaomiModel(
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
    brandSlug: "xiaomi",
    seriesSlug,
    name,
    nameEn,
    widthMm,
    heightMm,
    back: resolveChassisTemplate(template, widthMm, heightMm),
    baseCanvasWidth,
  });
}

export const XIAOMI_PHONE_MODELS: PhoneModel[] = [
  // Xiaomi 15
  xiaomiModel("xiaomi-15-ultra", "xiaomi", "شیائومی ۱۵ اولترا", "Xiaomi 15 Ultra", 75.3, 161.3, "xiaomi-ultra-quad"),
  xiaomiModel("xiaomi-15-pro", "xiaomi", "شیائومی ۱۵ پرو", "Xiaomi 15 Pro", 75.3, 161.3, "xiaomi-flagship-triple"),
  xiaomiModel("xiaomi-15", "xiaomi", "شیائومی ۱۵", "Xiaomi 15", 71.5, 152.3, "xiaomi-flagship-triple"),

  // Xiaomi 14
  xiaomiModel("xiaomi-14-ultra", "xiaomi", "شیائومی ۱۴ اولترا", "Xiaomi 14 Ultra", 75.3, 161.4, "xiaomi-ultra-quad"),
  xiaomiModel("xiaomi-14-pro", "xiaomi", "شیائومی ۱۴ پرو", "Xiaomi 14 Pro", 75.3, 161.4, "xiaomi-flagship-triple"),
  xiaomiModel("xiaomi-14", "xiaomi", "شیائومی ۱۴", "Xiaomi 14", 71.5, 152.8, "xiaomi-flagship-triple"),
  xiaomiModel("xiaomi-14t-pro", "xiaomi", "شیائومی ۱۴T Pro", "Xiaomi 14T Pro", 75.1, 160.4, "xiaomi-t-triple"),
  xiaomiModel("xiaomi-14t", "xiaomi", "شیائومی ۱۴T", "Xiaomi 14T", 75.1, 160.4, "xiaomi-t-triple"),

  // Xiaomi 13
  xiaomiModel("xiaomi-13-ultra", "xiaomi", "شیائومی ۱۳ اولترا", "Xiaomi 13 Ultra", 74.6, 163.2, "xiaomi-ultra-quad"),
  xiaomiModel("xiaomi-13-pro", "xiaomi", "شیائومی ۱۳ پرو", "Xiaomi 13 Pro", 74.6, 163.0, "xiaomi-flagship-triple"),
  xiaomiModel("xiaomi-13", "xiaomi", "شیائومی ۱۳", "Xiaomi 13", 71.5, 152.8, "xiaomi-flagship-triple"),
  xiaomiModel("xiaomi-13t-pro", "xiaomi", "شیائومی ۱۳T Pro", "Xiaomi 13T Pro", 75.9, 162.2, "xiaomi-t-triple"),
  xiaomiModel("xiaomi-13t", "xiaomi", "شیائومی ۱۳T", "Xiaomi 13T", 75.9, 162.2, "xiaomi-t-triple"),

  // Xiaomi 12
  xiaomiModel("xiaomi-12-ultra", "xiaomi", "شیائومی ۱۲ اولترا", "Xiaomi 12 Ultra", 75.2, 163.0, "xiaomi-ultra-quad"),
  xiaomiModel("xiaomi-12-pro", "xiaomi", "شیائومی ۱۲ پرو", "Xiaomi 12 Pro", 74.6, 163.0, "xiaomi-flagship-triple"),
  xiaomiModel("xiaomi-12", "xiaomi", "شیائومی ۱۲", "Xiaomi 12", 69.9, 152.7, "xiaomi-flagship-triple"),
  xiaomiModel("xiaomi-12t-pro", "xiaomi", "شیائومی ۱۲T Pro", "Xiaomi 12T Pro", 75.9, 163.2, "xiaomi-t-triple"),
  xiaomiModel("xiaomi-12t", "xiaomi", "شیائومی ۱۲T", "Xiaomi 12T", 75.9, 163.2, "xiaomi-t-triple"),

  // Redmi Note 14
  xiaomiModel("redmi-note-14-pro-plus", "redmi-note", "ردمی نوت ۱۴ Pro+", "Redmi Note 14 Pro+", 74.7, 162.2, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-14-pro", "redmi-note", "ردمی نوت ۱۴ Pro", "Redmi Note 14 Pro", 74.2, 162.4, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-14", "redmi-note", "ردمی نوت ۱۴", "Redmi Note 14", 76.5, 164.1, "redmi-note-dual"),

  // Redmi Note 13
  xiaomiModel("redmi-note-13-pro-plus", "redmi-note", "ردمی نوت ۱۳ Pro+", "Redmi Note 13 Pro+", 74.2, 161.1, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-13-pro", "redmi-note", "ردمی نوت ۱۳ Pro", "Redmi Note 13 Pro", 74.2, 161.1, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-13-pro-4g", "redmi-note", "ردمی نوت ۱۳ Pro 4G", "Redmi Note 13 Pro 4G", 76.0, 162.4, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-13", "redmi-note", "ردمی نوت ۱۳", "Redmi Note 13", 76.3, 161.3, "redmi-note-dual"),

  // Redmi Note 12
  xiaomiModel("redmi-note-12-pro-plus", "redmi-note", "ردمی نوت ۱۲ Pro+", "Redmi Note 12 Pro+", 76.2, 162.9, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-12-pro", "redmi-note", "ردمی نوت ۱۲ Pro", "Redmi Note 12 Pro", 76.0, 162.6, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-12", "redmi-note", "ردمی نوت ۱۲", "Redmi Note 12", 76.0, 165.9, "redmi-note-dual"),

  // Redmi Note 11
  xiaomiModel("redmi-note-11-pro-plus", "redmi-note", "ردمی نوت ۱۱ Pro+", "Redmi Note 11 Pro+", 76.4, 163.6, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-11-pro", "redmi-note", "ردمی نوت ۱۱ Pro", "Redmi Note 11 Pro", 76.0, 163.6, "redmi-note-triple-vertical"),
  xiaomiModel("redmi-note-11", "redmi-note", "ردمی نوت ۱۱", "Redmi Note 11", 76.3, 159.9, "redmi-note-dual"),

  // Redmi 14 / 13 / 12
  xiaomiModel("redmi-14", "redmi", "ردمی ۱۴", "Redmi 14", 77.8, 171.6, "redmi-dual-vertical"),
  xiaomiModel("redmi-13", "redmi", "ردمی ۱۳", "Redmi 13", 76.3, 166.9, "redmi-dual-vertical"),
  xiaomiModel("redmi-13-4g", "redmi", "ردمی ۱۳ 4G", "Redmi 13 4G", 76.3, 166.9, "redmi-dual-vertical"),
  xiaomiModel("redmi-12", "redmi", "ردمی ۱۲", "Redmi 12", 76.3, 168.6, "redmi-dual-vertical"),
  xiaomiModel("redmi-12-5g", "redmi", "ردمی ۱۲ 5G", "Redmi 12 5G", 76.3, 168.6, "redmi-dual-vertical"),

  // POCO X
  xiaomiModel("poco-x7-pro", "poco", "POCO X7 Pro", "POCO X7 Pro", 74.4, 160.8, "poco-x-triple"),
  xiaomiModel("poco-x7", "poco", "POCO X7", "POCO X7", 75.0, 160.8, "poco-x-triple"),
  xiaomiModel("poco-x6-pro", "poco", "POCO X6 Pro", "POCO X6 Pro", 74.3, 160.5, "poco-x-triple"),
  xiaomiModel("poco-x6", "poco", "POCO X6", "POCO X6", 75.0, 160.5, "poco-x-triple"),
  xiaomiModel("poco-x5-pro", "poco", "POCO X5 Pro", "POCO X5 Pro", 76.0, 162.9, "poco-x-triple"),

  // POCO F
  xiaomiModel("poco-f6-pro", "poco", "POCO F6 Pro", "POCO F6 Pro", 74.4, 160.5, "poco-f-triple"),
  xiaomiModel("poco-f6", "poco", "POCO F6", "POCO F6", 74.4, 160.5, "poco-f-triple"),
  xiaomiModel("poco-f5-pro", "poco", "POCO F5 Pro", "POCO F5 Pro", 75.0, 162.9, "poco-f-triple"),
  xiaomiModel("poco-f5", "poco", "POCO F5", "POCO F5", 75.0, 162.9, "poco-f-triple"),
  xiaomiModel("poco-f4", "poco", "POCO F4", "POCO F4", 76.4, 163.6, "poco-f-triple"),

  // POCO M
  xiaomiModel("poco-m6-pro", "poco", "POCO M6 Pro", "POCO M6 Pro", 74.2, 161.1, "poco-m-dual"),
  xiaomiModel("poco-m6", "poco", "POCO M6", "POCO M6", 77.8, 166.1, "poco-m-dual"),
  xiaomiModel("poco-m5", "poco", "POCO M5", "POCO M5", 76.4, 163.8, "poco-m-dual"),
];

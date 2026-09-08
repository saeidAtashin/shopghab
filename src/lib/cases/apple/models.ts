import { buildPhoneModel } from "../phone-back";
import type { PhoneModel } from "../types";
import { getChassisTemplate, resolveChassisTemplate } from "./chassis-templates";

function appleModel(
  slug: string,
  seriesSlug: string,
  name: string,
  nameEn: string,
  widthMm: number,
  heightMm: number,
  templateSlug: string,
): PhoneModel {
  const template = getChassisTemplate(templateSlug);
  return buildPhoneModel({
    slug,
    brandSlug: "apple",
    seriesSlug,
    name,
    nameEn,
    widthMm,
    heightMm,
    back: resolveChassisTemplate(template, widthMm, heightMm),
  });
}

export const APPLE_PHONE_MODELS: PhoneModel[] = [
  // iPhone 17
  appleModel("iphone-17-pro-max", "iphone-17", "آیفون ۱۷ پرو مکس", "iPhone 17 Pro Max", 78.0, 163.4, "iphone-17-pro-triple"),
  appleModel("iphone-17-pro", "iphone-17", "آیفون ۱۷ پرو", "iPhone 17 Pro", 71.9, 150.0, "iphone-17-pro-triple"),
  appleModel("iphone-air", "iphone-17", "آیفون ایر", "iPhone Air", 74.7, 156.2, "iphone-air-single"),
  appleModel("iphone-17", "iphone-17", "آیفون ۱۷", "iPhone 17", 71.5, 149.6, "iphone-16-dual"),

  // iPhone 16
  appleModel("iphone-16-pro-max", "iphone-16", "آیفون ۱۶ پرو مکس", "iPhone 16 Pro Max", 77.6, 163.0, "iphone-16-pro-triple"),
  appleModel("iphone-16-pro", "iphone-16", "آیفون ۱۶ پرو", "iPhone 16 Pro", 71.5, 149.6, "iphone-16-pro-triple"),
  appleModel("iphone-16-plus", "iphone-16", "آیفون ۱۶ پلاس", "iPhone 16 Plus", 77.8, 160.9, "iphone-16-dual"),
  appleModel("iphone-16", "iphone-16", "آیفون ۱۶", "iPhone 16", 71.6, 147.6, "iphone-16-dual"),

  // iPhone 15
  appleModel("iphone-15-pro-max", "iphone-15", "آیفون ۱۵ پرو مکس", "iPhone 15 Pro Max", 76.7, 159.9, "iphone-15-pro-triple"),
  appleModel("iphone-15-pro", "iphone-15", "آیفون ۱۵ پرو", "iPhone 15 Pro", 70.6, 146.6, "iphone-15-pro-triple"),
  appleModel("iphone-15-plus", "iphone-15", "آیفون ۱۵ پلاس", "iPhone 15 Plus", 77.8, 160.9, "iphone-12-dual-diagonal"),
  appleModel("iphone-15", "iphone-15", "آیفون ۱۵", "iPhone 15", 71.6, 147.6, "iphone-12-dual-diagonal"),

  // iPhone 14
  appleModel("iphone-14-pro-max", "iphone-14", "آیفون ۱۴ پرو مکس", "iPhone 14 Pro Max", 77.6, 160.7, "iphone-12-pro-triple"),
  appleModel("iphone-14-pro", "iphone-14", "آیفون ۱۴ پرو", "iPhone 14 Pro", 71.5, 147.5, "iphone-12-pro-triple"),
  appleModel("iphone-14-plus", "iphone-14", "آیفون ۱۴ پلاس", "iPhone 14 Plus", 78.1, 160.8, "iphone-12-dual-diagonal"),
  appleModel("iphone-14", "iphone-14", "آیفون ۱۴", "iPhone 14", 71.5, 146.7, "iphone-12-dual-diagonal"),

  // iPhone 13
  appleModel("iphone-13-pro-max", "iphone-13", "آیفون ۱۳ پرو مکس", "iPhone 13 Pro Max", 78.1, 160.8, "iphone-12-pro-triple"),
  appleModel("iphone-13-pro", "iphone-13", "آیفون ۱۳ پرو", "iPhone 13 Pro", 71.5, 146.7, "iphone-12-pro-triple"),
  appleModel("iphone-13-mini", "iphone-13", "آیفون ۱۳ مینی", "iPhone 13 mini", 64.2, 131.5, "iphone-12-dual-diagonal"),
  appleModel("iphone-13", "iphone-13", "آیفون ۱۳", "iPhone 13", 71.5, 146.7, "iphone-12-dual-diagonal"),

  // iPhone 12
  appleModel("iphone-12-pro-max", "iphone-12", "آیفون ۱۲ پرو مکس", "iPhone 12 Pro Max", 78.1, 160.8, "iphone-12-pro-triple"),
  appleModel("iphone-12-pro", "iphone-12", "آیفون ۱۲ پرو", "iPhone 12 Pro", 71.5, 146.7, "iphone-12-pro-triple"),
  appleModel("iphone-12-mini", "iphone-12", "آیفون ۱۲ مینی", "iPhone 12 mini", 64.2, 131.5, "iphone-12-dual-diagonal"),
  appleModel("iphone-12", "iphone-12", "آیفون ۱۲", "iPhone 12", 71.5, 146.7, "iphone-12-dual-diagonal"),

  // iPhone 11
  appleModel("iphone-11-pro-max", "iphone-11", "آیفون ۱۱ پرو مکس", "iPhone 11 Pro Max", 77.8, 158.0, "iphone-11-pro-triple"),
  appleModel("iphone-11-pro", "iphone-11", "آیفون ۱۱ پرو", "iPhone 11 Pro", 71.4, 144.0, "iphone-11-pro-triple"),
  appleModel("iphone-11", "iphone-11", "آیفون ۱۱", "iPhone 11", 75.7, 150.9, "iphone-11-dual"),

  // iPhone X series
  appleModel("iphone-xs-max", "iphone-x", "آیفون XS Max", "iPhone XS Max", 77.8, 157.5, "iphone-x-dual-vertical"),
  appleModel("iphone-xs", "iphone-x", "آیفون XS", "iPhone XS", 70.9, 143.6, "iphone-x-dual-vertical"),
  appleModel("iphone-xr", "iphone-x", "آیفون XR", "iPhone XR", 75.7, 150.9, "iphone-xr-single"),
  appleModel("iphone-x", "iphone-x", "آیفون X", "iPhone X", 70.9, 143.6, "iphone-x-dual-vertical"),

  // iPhone SE
  appleModel("iphone-se-3", "iphone-se", "آیفون SE (نسل ۳)", "iPhone SE (3rd gen)", 67.3, 138.4, "iphone-se-single"),
  appleModel("iphone-se-2", "iphone-se", "آیفون SE (نسل ۲)", "iPhone SE (2nd gen)", 67.3, 138.4, "iphone-se-single"),
];

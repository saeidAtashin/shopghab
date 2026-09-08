import { buildPhoneModel } from "./phone-back";
import type { PhoneBackGeometry, PhoneBrand, PhoneModel } from "./types";

const WIDTH_MM = 75;
const HEIGHT_MM = 160;

const GENERIC_CUSTOM_BACK: PhoneBackGeometry = {
  cornerRadiusMm: WIDTH_MM * 0.14,
  camera: {
    module: {
      x: WIDTH_MM * 0.06,
      y: HEIGHT_MM * 0.025,
      width: WIDTH_MM * 0.38,
      height: WIDTH_MM * 0.38,
      cornerRadius: WIDTH_MM * 0.08,
    },
    lenses: [
      { cx: WIDTH_MM * 0.16, cy: HEIGHT_MM * 0.065, r: WIDTH_MM * 0.065 },
      { cx: WIDTH_MM * 0.32, cy: HEIGHT_MM * 0.065, r: WIDTH_MM * 0.065 },
      { cx: WIDTH_MM * 0.24, cy: HEIGHT_MM * 0.115, r: WIDTH_MM * 0.065 },
    ],
  },
  logo: { cx: WIDTH_MM / 2, cy: HEIGHT_MM * 0.52, r: WIDTH_MM * 0.045 },
  printSafeInsetMm: { top: 8, right: 4, bottom: 8, left: 4 },
  chassisTemplate: "generic-fallback",
};

export const OTHER_BRAND: PhoneBrand = {
  slug: "other",
  name: "مدل دیگر",
  nameEn: "Other",
  logo: "/cases/brands/other.svg",
};

export const GENERIC_CUSTOM_MODEL: PhoneModel = buildPhoneModel({
  slug: "custom",
  brandSlug: "other",
  seriesSlug: "other",
  name: "مدل دیگر",
  nameEn: "Custom model",
  widthMm: WIDTH_MM,
  heightMm: HEIGHT_MM,
  back: GENERIC_CUSTOM_BACK,
});

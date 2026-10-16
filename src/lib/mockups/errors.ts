export const mockupErrorCodes = [
  "missingArtwork",
  "unconfiguredRegion",
  "missingMask",
  "missingBase",
  "invalidOutput",
  "magickMissing",
  "photoshopMissing",
  "smartObjectMissing",
  "pathRejected",
  "unsupported",
  "invalidArtwork",
] as const;

export type MockupErrorCode = (typeof mockupErrorCodes)[number];

const SAFE_MESSAGE: Record<MockupErrorCode, string> = {
  missingArtwork: "فایل طرح اصلی پیدا نشد",
  unconfiguredRegion: "ناحیه چاپ این قالب مشخص نشده است",
  missingMask: "ماسک قالب آماده نیست",
  missingBase: "تصویر پایه قالب آماده نیست",
  invalidOutput: "فایل خروجی ساخته نشد",
  magickMissing: "ابزار تبدیل پرسپکتیو در دسترس نیست",
  photoshopMissing: "فتوشاپ برای این قالب تنظیم نشده است",
  smartObjectMissing: "نام Smart Object مشخص نشده است",
  pathRejected: "مسیر فایل مجاز نیست",
  unsupported: "این قالب پشتیبانی نمی‌شود",
  invalidArtwork: "فایل طرح قابل خواندن نیست",
};

export class MockupError extends Error {
  readonly code: MockupErrorCode;

  constructor(code: MockupErrorCode) {
    super(SAFE_MESSAGE[code]);
    this.name = "MockupError";
    this.code = code;
  }
}

export function safeMockupMessage(error: unknown): string {
  if (error instanceof MockupError) return error.message;
  return SAFE_MESSAGE.unsupported;
}

export const PHONE_MODELS = [
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15",
  "iPhone 14 Pro",
  "iPhone 13",
  "Samsung Galaxy S25 Ultra",
  "Samsung Galaxy S24 Ultra",
  "Samsung Galaxy S24",
  "Samsung Galaxy A55",
  "Xiaomi 14 Ultra",
  "Xiaomi Redmi Note 13",
] as const;

export type PhoneModel = (typeof PHONE_MODELS)[number];

export type CaseCategory = "ready" | "popular" | "minimal" | "art";

export type PhoneCase = {
  slug: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  phoneModels: string[];
  category: CaseCategory;
  tags: string[];
  featured?: boolean;
};

export const cases: PhoneCase[] = [
  {
    slug: "midnight-matte",
    title: "میدنایت مات",
    description:
      "قاب مات مشکی با لبه‌های نرم و محافظت کامل از دوربین — مینیمال و مقاوم.",
    price: 289000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 16 Pro", "iPhone 15 Pro", "Samsung Galaxy S24"],
    category: "minimal",
    tags: ["مات", "مشکی", "مینیمال"],
    featured: true,
  },
  {
    slug: "amber-gradient",
    title: "گرادیان کهربایی",
    description:
      "طرح گرادیان گرم کهربایی با چاپ UV باکیفیت — مناسب استایل روزمره.",
    price: 319000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 16 Pro Max", "iPhone 15 Pro Max", "Xiaomi 14 Ultra"],
    category: "popular",
    tags: ["گرادیان", "کهربایی", "پرطرفدار"],
    featured: true,
  },
  {
    slug: "persian-tile",
    title: "کاشی ایرانی",
    description:
      "نقش‌مایه‌های الهام‌گرفته از کاشی‌کاری ایرانی با رنگ‌های زنده و ماندگار.",
    price: 349000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 16", "iPhone 14 Pro", "Samsung Galaxy A55"],
    category: "art",
    tags: ["هنری", "ایرانی", "طرح‌دار"],
    featured: true,
  },
  {
    slug: "clear-armor",
    title: "شفاف آرمر",
    description:
      "قاب شفاف ضدخش با گوشه‌های تقویت‌شده — زیبایی گوشی حفظ می‌شود.",
    price: 259000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 15", "iPhone 13", "Samsung Galaxy S24 Ultra"],
    category: "ready",
    tags: ["شفاف", "محافظ", "ساده"],
  },
  {
    slug: "soft-blush",
    title: "بلوش نرم",
    description: "پالت صورتی ملایم با بافت نرم لمسی — سبک و شیک.",
    price: 299000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 16 Pro", "iPhone 15", "Xiaomi Redmi Note 13"],
    category: "popular",
    tags: ["صورتی", "نرم", "زنانه"],
    featured: true,
  },
  {
    slug: "urban-lines",
    title: "خطوط شهری",
    description: "خطوط هندسی شهری روی زمینه تیره — ظاهر مدرن و جسور.",
    price: 329000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["Samsung Galaxy S25 Ultra", "iPhone 16 Pro Max", "Xiaomi 14 Ultra"],
    category: "art",
    tags: ["هندسی", "مدرن", "شهری"],
  },
  {
    slug: "ocean-mist",
    title: "مه اقیانوس",
    description: "ترکیب آبی مه‌آلود با حس آرامش — چاپ دقیق و مقاوم در برابر محو شدن.",
    price: 309000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 15 Pro", "Samsung Galaxy S24", "iPhone 14 Pro"],
    category: "ready",
    tags: ["آبی", "آرام", "گرادیان"],
  },
  {
    slug: "mono-chrome",
    title: "مونوکروم",
    description: "ترکیب سیاه‌وسفید تایپوگرافی‌محور برای عاشقان استایل مینیمال.",
    price: 279000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 16", "iPhone 13", "Samsung Galaxy A55"],
    category: "minimal",
    tags: ["سیاه‌وسفید", "تایپوگرافی", "مینیمال"],
  },
  {
    slug: "floral-dusk",
    title: "گل‌های غروب",
    description: "گل‌آرایی ظریف روی پس‌زمینه غروب — مناسب هدیه و استایل خاص.",
    price: 339000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["iPhone 16 Pro Max", "iPhone 15 Pro Max", "Samsung Galaxy S24 Ultra"],
    category: "art",
    tags: ["گل", "هدیه", "رنگی"],
    featured: true,
  },
  {
    slug: "sport-grip",
    title: "اسپرت گریپ",
    description: "بافت ضدلغزش ورزشی با لبه‌های برجسته — مناسب استفاده روزمره سنگین.",
    price: 269000,
    images: ["/images/ps5-repair.webp"],
    phoneModels: ["Samsung Galaxy S25 Ultra", "Xiaomi 14 Ultra", "iPhone 16 Pro"],
    category: "ready",
    tags: ["اسپرت", "ضدلغزش", "مقاوم"],
  },
];

export function getCaseBySlug(slug: string): PhoneCase | undefined {
  return cases.find((item) => item.slug === slug);
}

export function getFeaturedCases(): PhoneCase[] {
  return cases.filter((item) => item.featured);
}

export function formatCasePrice(price: number): string {
  return `${price.toLocaleString("fa-IR")} تومان`;
}

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  ready: "آماده ارسال",
  popular: "پرطرفدار",
  minimal: "مینیمال",
  art: "هنری",
};

import type { FaqItem } from "@/app/components/seo/FaqSection";
import type { TrustSignal } from "@/app/components/seo/TrustSignalsBar";
import type { Issue } from "@/app/data/issues";

const DIFFICULTY_LABELS: Record<NonNullable<Issue["difficulty"]>, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "پیشرفته",
};

const COST_LABELS: Record<NonNullable<Issue["costLevel"]>, string> = {
  low: "پایین",
  medium: "متوسط",
  high: "بالا",
};

function consoleLabelFromSlug(slug: string): string {
  if (slug.startsWith("ps5")) return "پلی‌استیشن 5 (PS5)";
  if (slug.startsWith("ps4")) return "پلی‌استیشن 4 (PS4)";
  if (slug.startsWith("xbox")) return "Xbox";
  if (slug.startsWith("controller")) return "دسته بازی PS و Xbox";
  if (slug.startsWith("console")) return "کنسول‌های PS و Xbox";
  return "کنسول بازی";
}

function servicePathFromSlug(slug: string): string {
  if (slug.startsWith("ps5")) return "/services/ps5-repair";
  if (slug.startsWith("ps4")) return "/services/ps4-repair";
  if (slug.startsWith("xbox")) return "/services/xbox-repair";
  if (slug.startsWith("controller")) return "/services/controller-repair";
  if (slug.startsWith("console")) return "/services/hdmi-repair";
  return "/services";
}

function formatList(items: string[], max = 5): string {
  const slice = items.slice(0, max);
  if (items.length <= max) return slice.join("، ");
  return `${slice.join("، ")} و سایر موارد`;
}

export type IssueSeoExtras = {
  overview: string[];
  faqs: FaqItem[];
  servicePath: string;
  consoleLabel: string;
};

export function buildIssueSeoExtras(issue: Issue): IssueSeoExtras {
  const consoleLabel = consoleLabelFromSlug(issue.slug);
  const servicePath = servicePathFromSlug(issue.slug);
  const difficulty = issue.difficulty
    ? DIFFICULTY_LABELS[issue.difficulty]
    : "متوسط";
  const cost = issue.costLevel ? COST_LABELS[issue.costLevel] : "متوسط";
  const repairTime = issue.repairTime ?? "۱ تا ۳ روز کاری";

  const overview = [
    `${issue.description} این مشکل در ${consoleLabel} نسبتاً شناخته‌شده است و اگر به‌موقع بررسی نشود می‌تواند به آسیب‌های گسترده‌تر منجر شود. در این راهنما علائم، علل رایج، راه‌حل تخصصی و نکات پیشگیری ${issue.title} را به‌صورت کاربردی مرور می‌کنیم تا قبل از ثبت سفارش تعمیر، تصویر روشنی از وضعیت دستگاه داشته باشید.`,
    `کاربران معمولاً با علائمی مانند ${formatList(issue.symptoms)} مواجه می‌شوند. اگر چند مورد از این نشانه‌ها همزمان دیده شود، احتمالاً مشکل صرفاً نرم‌افزاری نیست و نیاز به بررسی سخت‌افزاری دارد. توصیه می‌شود قبل از هر اقدام DIY، کنسول را از برق جدا کنید و از باز کردن دستگاه بدون تجربه کافی خودداری نمایید.`,
    `علل رایج ${issue.title} شامل ${formatList(issue.causes)} است. گاهی یک علامت ظاهری (مثل قطع تصویر) می‌تواند چند علت مختلف داشته باشد؛ به همین دلیل عیب‌یابی مرحله‌ای با ابزار تخصصی اهمیت دارد. در مرکز کنسول ریپیر ابتدا علت ریشه‌ای مشخص می‌شود و سپس مقرون‌به‌صرفه‌ترین مسیر تعمیر پیشنهاد می‌گردد.`,
    `${issue.solution} سطح سختی تعمیر این مورد ${difficulty} ارزیابی می‌شود و زمان تقریبی ${repairTime} است. بازه هزینه معمولاً ${cost} است؛ البته قیمت نهایی پس از بازرسی فیزیکی دستگاه و تأیید قطعه مورد نیاز اعلام می‌شود.`,
    `برای پیشگیری از تکرار مشکل، ${formatList(issue.prevention, 4)} توصیه می‌شود. اگر پس از ریست یا بررسی‌های اولیه مشکل پابرجا بود، از صفحه ثبت سفارش تعمیر درخواست خود را با ذکر «${issue.title}» ثبت کنید تا کارشناسان ما هماهنگی لازم را انجام دهند. تمامی تعمیرات سخت‌افزاری شامل ضمانت تست ۳۰ روزه است.`,
  ];

  const faqs: FaqItem[] = [
    {
      question: `علائم اصلی ${issue.title} چیست؟`,
      answer: `رایج‌ترین علائم: ${formatList(issue.symptoms)}. اگر این نشانه‌ها مکرر یا همزمان رخ می‌دهند، بررسی تخصصی توصیه می‌شود.`,
    },
    {
      question: `علت ${issue.title} چه می‌تواند باشد؟`,
      answer: `دلایل محتمل شامل ${formatList(issue.causes)} است. تعیین علت دقیق نیازمند تست سخت‌افزار و گاهی بررسی برد است.`,
    },
    {
      question: "آیا می‌توانم خودم این مشکل را رفع کنم؟",
      answer: `سطح سختی تعمیر ${difficulty} است. برای موارد سخت‌افزاری، باز کردن دستگاه بدون ابزار مناسب می‌تواند خسارت بیشتری وارد کند. عیب‌یابی اولیه (ریست، بررسی کابل) مجاز است؛ تعمیر برد و قطعات حیاتی را به تکنسین بسپارید.`,
    },
    {
      question: "تعمیر این مشکل چقدر زمان می‌برد؟",
      answer: `زمان تقریبی ${repairTime} است. در صورت نیاز به قطعه خاص یا تعمیر BGA، ممکن است تا ۵ روز کاری طول بکشد که از قبل اطلاع داده می‌شود.`,
    },
    {
      question: "هزینه تعمیر چقدر است؟",
      answer: `بازه هزینه معمولاً ${cost} است. پس از عیب‌یابی رایگان، برآورد دقیق اعلام می‌شود و بدون تأیید شما تعمیر آغاز نمی‌گردد.`,
    },
    {
      question: "چطور سفارش تعمیر ثبت کنم؟",
      answer: `از فرم ثبت سفارش تعمیر استفاده کنید و عنوان «${issue.title}» را در شرح مشکل بنویسید. می‌توانید عکس از دستگاه نیز ضمیمه کنید تا تشخیص سریع‌تر انجام شود.`,
    },
  ];

  return { overview, faqs, servicePath, consoleLabel };
}

export function enrichIssueSeoDescription(issue: Issue): string {
  const base = issue.seoDescription ?? issue.description;
  if (base.length >= 140) return base;
  return `${base} علائم، علل، راه‌حل تخصصی و هزینه تقریبی — راهنمای کامل قبل از ثبت تعمیر.`;
}

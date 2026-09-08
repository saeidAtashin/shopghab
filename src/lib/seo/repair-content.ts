import type { FaqItem } from "@/app/components/seo/FaqSection";
import type { TrustSignal } from "@/app/components/seo/TrustSignalsBar";
import type { ConsoleId } from "@/lib/console-catalog";

export type RepairContent = {
  overview: string[];
  processSteps: string[];
  faqs: FaqItem[];
  trustSignals: TrustSignal[];
};

const GENERIC_REPAIR_CONTENT: RepairContent = {
  overview: [
    "ثبت سفارش تعمیر در کنسول ریپیر ساده و سریع است. فرم بالا را تکمیل کنید: نوع دستگاه، شماره تماس، شرح مشکل و در صورت امکان عکس از خرابی. کارشناسان ما پس از دریافت درخواست برای هماهنگی تحویل دستگاه یا راهنمایی اولیه تماس می‌گیرند.",
    "فرآیند تعمیر شامل عیب‌یابی، اعلام هزینه شفاف، تعمیر با قطعات باکیفیت، تست کامل و تحویل با ضمانت ۳۰ روزه است. بدون تأیید شما هیچ تعمیری آغاز نمی‌شود. وضعیت سفارش را از بخش پیگیری تعمیر با کد رهگیری دنبال کنید.",
    "ما PS5، PS4، Xbox، HDMI و دسته بازی را تعمیر می‌کنیم. برای جزئیات هر خدمت به صفحات خدمات مراجعه کنید. اگر نوع دستگاه را می‌دانید، از فرم بالا انتخاب کنید تا درخواست دقیق‌تر ثبت شود.",
        "برای تهران امکان تحویل حضوری وجود دارد. سایر شهرها با بسته‌بندی ایمن و هماهنگی پست. قبل از ارسال، دستگاه را در جعبه محکم قرار دهید و کابل‌ها را جدا کنید.",
  ],
  processSteps: [
    "تکمیل فرم و دریافت کد رهگیری",
    "تماس کارشناس و هماهنگی تحویل",
    "عیب‌یابی و اعلام هزینه",
    "تعمیر پس از تأیید شما",
    "تست و تحویل با ضمانت",
  ],
  faqs: [
    {
      question: "بعد از ثبت فرم چه اتفاقی می‌افتد؟",
      answer:
        "کد رهگیری دریافت می‌کنید. کارشناس برای هماهنگی تحویل یا ارسال دستگاه تماس می‌گیرد. پس از عیب‌یابی هزینه اعلام می‌شود.",
    },
    {
      question: "آیا عیب‌یابی رایگان است؟",
      answer:
        "بررسی اولیه و اعلام هزینه رایگان است. در صورت انصراف پس از باز کردن دستگاه، هزینه عیب‌یابی جداگانه اعلام می‌شود.",
    },
    {
      question: "چطور وضعیت را پیگیری کنم؟",
      answer:
        "از صفحه پیگیری تعمیر با کد رهگیری و شماره تماس وضعیت را ببینید.",
    },
    {
      question: "چه اطلاعاتی در فرم بنویسم؟",
      answer:
        "نوع دستگاه، علائم (مثلاً روشن نمی‌شود، تصویر ندارد)، زمان شروع مشکل و کارهایی که انجام داده‌اید. عکس کمک زیادی می‌کند.",
    },
    {
      question: "ضمانت تعمیر چقدر است؟",
      answer:
        "۳۰ روز ضمانت تست برای تعمیرات سخت‌افزاری کنسول. جزئیات در زمان تحویل توضیح داده می‌شود.",
    },
    {
      question: "آیا pickup دارید؟",
      answer:
        "برای تهران با هماهنگی قبلی امکان pickup وجود دارد. در فرم یا تماس اعلام کنید.",
    },
  ],
  trustSignals: [
    { icon: "expert", label: "تخصص", value: "PS5 · PS4 · Xbox" },
    { icon: "shield", label: "ضمانت", value: "۳۰ روز تست" },
    { icon: "clock", label: "تحویل", value: "۱ تا ۵ روز کاری" },
    { icon: "price", label: "قیمت", value: "اعلام قبل از تعمیر" },
  ],
};

const CONSOLE_REPAIR_CONTENT: Partial<Record<ConsoleId, Partial<RepairContent>>> =
  {
    ps5: {
      overview: [
        "ثبت درخواست تعمیر PS5 — فرم را برای پلی‌استیشن 5 تکمیل کنید. مشکلات رایج: HDMI، داغ شدن، روشن نشدن، فن پرصدا، DualSense و درایو دیسک.",
        "تیم ما با station BGA و قطعات اورجینال PS5 کار می‌کند. پس از عیب‌یابی، هزینه شفاف اعلام و ۳۰ روز ضمانت تست ارائه می‌شود.",
        "قبل از تحویل، خروجی 4K، خواندن دیسک، Wi-Fi و اجرای بازی تست می‌شود. جزئیات بیشتر در صفحه تعمیر PS5.",
      ],
      faqs: [
        {
          question: "تعمیر PS5 چقدر طول می‌کشد؟",
          answer: "۱ تا ۵ روز کاری بسته به خرابی. HDMI معمولاً ۱–۳ روز.",
        },
        {
          question: "هزینه از چقدر شروع می‌شود؟",
          answer: "از حدود ۸۰۰ هزار تومان. برآورد دقیق پس از عیب‌یابی.",
        },
      ],
    },
    ps4: {
      overview: [
        "ثبت درخواست تعمیر PS4 — Slim، Pro و Fat. مشکلات: HDMI، پاور، فن، هارد، Safe Mode.",
        "داده‌های save در اکثر تعمیرات حفظ می‌شوند. ۳۰ روز ضمانت تست.",
        "جزئیات در صفحه تعمیر PS4.",
      ],
      faqs: [
        {
          question: "PS4 Pro هم پذیرش می‌شود؟",
          answer: "بله، تمامی مدل‌های PS4.",
        },
        {
          question: "Safe Mode می‌ماند؟",
          answer: "پس از تعمیر سخت‌افزار یا نرم‌افزار مربوطه، رفع می‌شود.",
        },
      ],
    },
    xbox: {
      overview: [
        "ثبت درخواست تعمیر Xbox — Series X/S و One. HDMI، پاور، فن، هارد و خطاهای سیستم.",
        "پس از تعمیر Game Pass و Xbox Live تست می‌شود.",
        "جزئیات در صفحه تعمیر Xbox.",
      ],
      faqs: [
        {
          question: "Series S و X هر دو؟",
          answer: "بله، تمامی مدل‌های Xbox.",
        },
        {
          question: "اکانت Microsoft حفظ می‌شود؟",
          answer: "بله، مگر تعویض هارد با بازنشانی کامل که هماهنگ می‌شود.",
        },
      ],
    },
  };

export function getRepairContent(consoleId?: ConsoleId): RepairContent {
  if (!consoleId) return GENERIC_REPAIR_CONTENT;

  const override = CONSOLE_REPAIR_CONTENT[consoleId];
  if (!override) return GENERIC_REPAIR_CONTENT;

  return {
    overview: override.overview ?? GENERIC_REPAIR_CONTENT.overview,
    processSteps:
      override.processSteps ?? GENERIC_REPAIR_CONTENT.processSteps,
    faqs: [...GENERIC_REPAIR_CONTENT.faqs, ...(override.faqs ?? [])],
    trustSignals:
      override.trustSignals ?? GENERIC_REPAIR_CONTENT.trustSignals,
  };
}

export const REPAIR_DEFAULT_DESCRIPTION =
  "ثبت آنلاین سفارش تعمیر PS5، PS4 و Xbox — عیب‌یابی رایگان، قیمت شفاف، ضمانت ۳۰ روزه و پیگیری آنلاین. فرم را تکمیل کنید تا کارشناسان تماس بگیرند.";

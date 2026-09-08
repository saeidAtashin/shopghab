import type { FaqItem } from "@/app/components/seo/FaqSection";
import type { TrustSignal } from "@/app/components/seo/TrustSignalsBar";
import type { GameFilterId } from "@/lib/game-filters";

export type GameInstallConsoleSlug =
  | "ps4"
  | "ps5"
  | "xbox-one"
  | "xbox-series";

export type GameInstallContent = {
  overview: string[];
  processSteps: string[];
  faqs: FaqItem[];
  trustSignals: TrustSignal[];
  gamesPageIntro: string[];
  filterIntros: Partial<Record<GameFilterId, string>>;
  /** Pricing section keys to show for this console */
  pricingSectionKeys: (
    | "accountCapacityInstallation"
    | "economyPackagesRandomGames"
    | "jailbreakOfflineInstallation"
    | "xboxInstallation"
    | "additionalServices"
  )[];
};

const PS_ACCOUNT_SECTIONS = [
  "accountCapacityInstallation",
  "economyPackagesRandomGames",
  "additionalServices",
] as const;

const PS4_SECTIONS = [
  "accountCapacityInstallation",
  "economyPackagesRandomGames",
  "jailbreakOfflineInstallation",
  "additionalServices",
] as const;

const XBOX_SECTIONS = [
  "accountCapacityInstallation",
  "economyPackagesRandomGames",
  "xboxInstallation",
  "additionalServices",
] as const;

export const gameInstallContent: Record<GameInstallConsoleSlug, GameInstallContent> =
  {
    ps5: {
      pricingSectionKeys: [...PS_ACCOUNT_SECTIONS],
      overview: [
        "نصب بازی روی PS5 با توجه به نسخه دیجیتال یا دیسک‌خور، ظرفیت SSD و نوع اکانت متفاوت است. در کنسول ریپیر، نصب با اکانت ظرفیتی/اشتراکی، پکیج‌های اقتصادی و خدمات جانبی مانند انتقال ذخیره و به‌روزرسانی سیستم ارائه می‌شود. قبل از هر نصب، وضعیت کنسول و فضای خالی بررسی می‌گردد.",
        "PS5 دیجیتال فقط بازی‌های دیجیتال را پشتیبانی می‌کند؛ مدل دیسک‌خور امکان نصب از دیسک فیزیکی را نیز دارد. برای نصب دیجیتال، اکانت معتبر و اتصال اینترنت پایدار لازم است. پس از نصب، بازی تست و دستورالعمل استفاده به شما داده می‌شود.",
        "هزینه نصب بسته به تعداد بازی، نوع اکانت و خدمات اضافی متغیر است. تعرفه‌های پایین صفحه راهنمای بازه قیمت هستند و پس از انتخاب بازی‌ها، مبلغ دقیق اعلام می‌شود. تمامی مراحل با رضایت شما انجام می‌گیرد.",
        "برای انتخاب بازی می‌توانید از کاتالوگ محبوب‌ترین عناوین PS5 در پایین صفحه استفاده کنید یا لیست دلخواه خود را اعلام نمایید. پشتیبانی پس از نصب برای رفع مشکلات اولیه اجرا یا دانلود نیز در دسترس است.",
      ],
      processSteps: [
        "بررسی مدل PS5 و فضای SSD",
        "انتخاب نوع نصب و لیست بازی",
        "اعلام هزینه نهایی",
        "نصب و تست اجرای بازی",
        "تحویل با راهنمای استفاده",
      ],
      faqs: [
        {
          question: "نصب بازی PS5 چقدر زمان می‌برد؟",
          answer:
            "بسته به حجم بازی‌ها و سرعت اینترنت، از چند ساعت تا ۱ روز. پکیج‌های بزرگ ممکن است بیشتر طول بکشد که از قبل هماهنگ می‌شود.",
        },
        {
          question: "آیا اکانت ظرفیتی محدودیت دارد؟",
          answer:
            "بله، ممکن است محدودیت آنلاین یا تغییر دسترسی داشته باشد. قبل از نصب توضیحات کامل ارائه می‌شود.",
        },
        {
          question: "PS5 دیجیتال و دیسک‌خور تفاوت قیمت دارند؟",
          answer:
            "هزینه نصب دیجیتال بسته به تعداد بازی است. نصب از دیسک فیزیکی جداگانه برآورد می‌شود.",
        },
        {
          question: "آیا داده‌های من حفظ می‌شود؟",
          answer:
            "در نصب استاندارد، save و اکانت شخصی شما دست‌نخورده می‌ماند. پیش از هر اقدام هماهنگی انجام می‌شود.",
        },
        {
          question: "چطور درخواست ثبت کنم؟",
          answer:
            "دکمه «ثبت درخواست نصب بازی» را بزنید، مدل PS5 را انتخاب و لیست بازی یا پکیج مورد نظر را بنویسید.",
        },
      ],
      trustSignals: [
        { icon: "shield", label: "حفظ داده", value: "save و اکانت شما" },
        { icon: "clock", label: "زمان نصب", value: "چند ساعت تا ۱ روز" },
        { icon: "expert", label: "تست پس از نصب", value: "اجرای بازی تأیید می‌شود" },
        { icon: "price", label: "قیمت شفاف", value: "اعلام قبل از شروع" },
      ],
      gamesPageIntro: [
        "در این صفحه لیست بازی‌های محبوب PS5 را می‌بینید که بر اساس فیلتر انتخابی (پرطرفدار، جدید، امتیاز یا متاکریتیک) مرتب شده‌اند. این فهرست راهنمای انتخاب عناوین برای نصب است و شامل تمامی بازی‌های موجود در بازار نمی‌شود.",
        "پس از انتخاب بازی‌ها، به صفحه تعرفه PS5 برگردید یا مستقیماً درخواست نصب ثبت کنید. تیم ما سازگاری نسخه PS5، حجم مورد نیاز و نوع نصب (اکانتی یا دیجیتال) را بررسی می‌کند.",
        "بازی‌های AAA مانند God of War Ragnarök، Spider-Man 2 و Elden Ring از پرتقاضاترین عناوین نصب روی PS5 هستند. می‌توانید ترکیب دلخواه خود را اعلام کنید.",
      ],
      filterIntros: {
        popular: "پرفروش‌ترین و پرطرفدارترین بازی‌های PS5 برای الهام گرفتن در انتخاب پکیج نصب.",
        newest: "جدیدترین انتشارهای PS5 — مناسب اگر دنبال تازه‌ترین عناوین هستید.",
        best: "بالاترین امتیاز کاربران در RAWG — انتخاب‌های باکیفیت و تأییدشده.",
        metacritic: "برترین نمرات منتقدان — برای علاقه‌مندان به بازی‌های critique-approved.",
      },
    },

    ps4: {
      pricingSectionKeys: [...PS4_SECTIONS],
      overview: [
        "نصب بازی PS4 شامل چند روش است: نصب با اکانت ظرفیتی/اشتراکی، پکیج اقتصادی بازی تصادفی، و نصب آفلاین روی کنسول کپی‌خور (Jailbreak). هر روش مزایا و محدودیت‌های خود را دارد که قبل از شروع توضیح داده می‌شود.",
        "روی PS4 کپی‌خور، بازی‌ها به صورت آفلاین نصب می‌شوند و امکان بازی آنلاین یا آپدیت رسمی وجود ندارد. هزینه این روش معمولاً پایین‌تر است و برای کاربرانی که فقط آفلاین بازی می‌کنند مناسب است.",
        "نصب اکانتی برای PS4 رسمی مناسب است و با اکانت ظرفیتی یا اشتراکی انجام می‌شود. محدودیت‌های آنلاین و ظرفیت اکانت از قبل شفاف اعلام می‌گردد. پس از نصب، بازی اجرا و تست می‌شود.",
        "ظرفیت هارد PS4 (معمولاً ۵۰۰GB تا 1TB) در انتخاب تعداد بازی مؤثر است. در صورت نیاز به ارتقای HDD/SSD می‌توانید همزمان درخواست دهید.",
      ],
      processSteps: [
        "بررسی مدل PS4 (Fat/Slim/Pro) و وضعیت کپی‌خور",
        "انتخاب روش نصب و لیست بازی",
        "اعلام هزینه",
        "نصب و تست",
        "تحویل با راهنما",
      ],
      faqs: [
        {
          question: "تفاوت نصب اکانتی و کپی‌خور چیست؟",
          answer:
            "اکانتی روی PS4 رسمی با اینترنت؛ کپی‌خور آفلاین بدون آنلاین. هزینه و محدودیت‌ها متفاوت است.",
        },
        {
          question: "PS4 Pro فضای بیشتری نیاز دارد؟",
          answer:
            "خیر، فضا به تعداد و حجم بازی‌ها بستگی دارد نه مدل Pro. Pro ممکن است patch 4K بیشتری دانلود کند.",
        },
        {
          question: "پکیج اقتصادی یعنی چه؟",
          answer:
            "بازی‌ها تصادفی انتخاب می‌شوند و شما لیست مشخص نمی‌دهید. قیمت پایین‌تر است.",
        },
        {
          question: "آیا می‌توانم بعداً بازی اضافه کنم؟",
          answer:
            "بله، با مراجعه مجدد یا ثبت درخواست جدید. هزینه تک‌بازی یا پکیج جداگانه محاسبه می‌شود.",
        },
        {
          question: "نصب چقدر طول می‌کشد؟",
          answer:
            "از ۲ ساعت برای تک‌بازی تا ۱ روز برای پکیج بزرگ، بسته به حجم و روش نصب.",
        },
      ],
      trustSignals: [
        { icon: "shield", label: "شفافیت", value: "محدودیت هر روش توضیح داده می‌شود" },
        { icon: "clock", label: "زمان", value: "۲ ساعت تا ۱ روز" },
        { icon: "expert", label: "تست", value: "اجرای بازی قبل از تحویل" },
        { icon: "price", label: "تعرفه", value: "جدول قیمت شفاف" },
      ],
      gamesPageIntro: [
        "فهرست بازی‌های PS4 در این صفحه بر اساس فیلتر انتخابی مرتب شده است. از این لیست برای انتخاب عناوین نصب روی PS4 Slim، Pro یا Fat استفاده کنید.",
        "PS4 کتابخانه عظیمی دارد؛ از exclusives مانند The Last of Us Part II تا multiplatformها. پس از انتخاب، درخواست نصب ثبت کنید.",
        "برای کنسول کپی‌خور، برخی بازی‌های آنلاین-only قابل نصب نیستند. تیم ما سازگاری را قبل از نصب تأیید می‌کند.",
      ],
      filterIntros: {
        popular: "محبوب‌ترین بازی‌های PS4 — مناسب پکیج‌های پرطرفدار.",
        newest: "آخرین انتشارها روی پلتفرم PS4.",
        best: "بالاترین امتیاز کاربران.",
        metacritic: "برترین بازی‌ها از نگاه منتقدان.",
      },
    },

    "xbox-one": {
      pricingSectionKeys: [...XBOX_SECTIONS],
      overview: [
        "نصب بازی Xbox One شامل نصب با اکانت، پکیج اقتصادی و روش‌های اختصاصی Xbox است. با توجه به نزدیک شدن به پایان پشتیبانی برخی سرویس‌ها، انتخاب روش نصب و نوع اکانت اهمیت بیشتری دارد.",
        "Xbox One S و One X از نظر ظرفیت و Performance متفاوتند اما فرآیند نصب مشابه است. Game Pass و اکانت Microsoft در برخی روش‌ها نقش دارند که قبل از نصب توضیح داده می‌شود.",
        "هزینه نصب بسته به تعداد بازی و نوع سرویس متغیر است. جدول تعرفه پایین صفحه بازه قیمت را نشان می‌دهد.",
        "پس از نصب، بازی اجرا، multiplayer (در صورت مجاز بودن روش نصب) و ذخیره‌سازی ابری تست می‌شود.",
      ],
      processSteps: [
        "بررسی مدل Xbox One",
        "انتخاب روش نصب",
        "اعلام هزینه",
        "نصب و تست",
        "تحویل",
      ],
      faqs: [
        {
          question: "Xbox One X و S تفاوت نصب دارند؟",
          answer: "فرآیند یکسان است؛ One X ممکن است نسخه X-enhanced نصب کند.",
        },
        {
          question: "Game Pass شامل نصب می‌شود؟",
          answer:
            "بسته به نوع سرویس درخواستی. جزئیات در زمان ثبت سفارش هماهنگ می‌شود.",
        },
        {
          question: "چقدر فضا نیاز است؟",
          answer:
            "بسته به بازی‌ها؛ Xbox One معمولاً 500GB تا 1TB. فضای خالی قبل از نصب بررسی می‌شود.",
        },
        {
          question: "آیا آنلاین بازی می‌توانم؟",
          answer:
            "بسته به روش نصب. محدودیت‌ها قبل از شروع شفاف اعلام می‌شود.",
        },
        {
          question: "زمان نصب چقدر است؟",
          answer: "از چند ساعت تا ۱ روز بسته به حجم.",
        },
      ],
      trustSignals: [
        { icon: "shield", label: "اکانت Microsoft", value: "راهنمایی پس از نصب" },
        { icon: "clock", label: "زمان", value: "چند ساعت تا ۱ روز" },
        { icon: "expert", label: "تست", value: "اجرای بازی" },
        { icon: "price", label: "قیمت", value: "شفاف و قبل از شروع" },
      ],
      gamesPageIntro: [
        "لیست بازی‌های Xbox One برای کمک به انتخاب عناوین نصب. فیلترها شامل پرطرفدار، جدید، امتیاز و متاکریتیک است.",
        "Xbox One backward compatibility بازی‌های 360 زیادی دارد. سازگاری هر عنوان قبل از نصب بررسی می‌شود.",
        "پس از انتخاب، از صفحه تعرفه Xbox One درخواست نصب ثبت کنید.",
      ],
      filterIntros: {
        popular: "پرطرفدارترین بازی‌های Xbox One.",
        newest: "جدیدترین عناوین.",
        best: "بالاترین امتیاز.",
        metacritic: "برترین از نگاه منتقدان.",
      },
    },

    "xbox-series": {
      pricingSectionKeys: [...XBOX_SECTIONS],
      overview: [
        "نصب بازی Xbox Series X|S با بهره از SSD سریع و Quick Resume انجام می‌شود. روش‌های نصب شامل اکانت ظرفیتی، پکیج اقتصادی و سرویس‌های اختصاصی Xbox است.",
        "Series X ظرفیت 1TB و Series S معمولاً 512GB دارد — انتخاب تعداد بازی با توجه به حجم (به‌ویژه AAA) مهم است. Smart Delivery نسخه مناسب کنسول را نصب می‌کند.",
        "پس از نصب، Quick Resume، خروجی 4K/120fps (در صورت پشتیبانی) و اتصال Xbox Live تست می‌شود.",
        "تعرفه‌ها در جدول پایین صفحه آمده است. برای پکیج‌های بزرگ، زمان بیشتری لازم است.",
      ],
      processSteps: [
        "بررسی Series X یا S و فضای SSD",
        "انتخاب بازی‌ها و روش نصب",
        "اعلام هزینه",
        "نصب و تست Quick Resume",
        "تحویل",
      ],
      faqs: [
        {
          question: "Series S بازی‌های Series X را نصب می‌کند؟",
          answer:
            "نسخه بهینه S نصب می‌شود. برخی بازی‌ها فقط digital هستند.",
        },
        {
          question: "Quick Resume بعد از نصب کار می‌کند؟",
          answer: "بله، پس از نصب صحیح تست می‌شود.",
        },
        {
          question: "Game Pass Ultimate شامل می‌شود؟",
          answer: "بسته به نوع درخواست؛ در ثبت سفارش هماهنگ می‌شود.",
        },
        {
          question: "فضای 512GB Series S کافی است؟",
          answer:
            "برای ۵–۱۰ بازی AAA ممکن است نیاز به HDD خارجی باشد. مشاوره می‌دهیم.",
        },
        {
          question: "زمان نصب؟",
          answer: "چند ساعت تا ۱ روز.",
        },
      ],
      trustSignals: [
        { icon: "shield", label: "SSD سریع", value: "نصب بهینه Series" },
        { icon: "clock", label: "زمان", value: "چند ساعت تا ۱ روز" },
        { icon: "expert", label: "تست", value: "Quick Resume و 4K" },
        { icon: "price", label: "تعرفه", value: "جدول شفاف" },
      ],
      gamesPageIntro: [
        "بازی‌های Xbox Series X|S در این فهرست. عناوین optimized for Series شامل Halo Infinite و Forza Horizon 5 هستند.",
        "فیلتر را تغییر دهید تا بر اساس محبوبیت، تاریخ یا امتیاز مرتب شوند.",
        "برای نصب، به تعرفه Xbox Series برگردید یا درخواست ثبت کنید.",
      ],
      filterIntros: {
        popular: "محبوب‌ترین بازی‌های Xbox Series.",
        newest: "جدیدترین releases.",
        best: "بالاترین rating.",
        metacritic: "Top metacritic scores.",
      },
    },
  };

export function getGameInstallContent(slug: string): GameInstallContent | undefined {
  return gameInstallContent[slug as GameInstallConsoleSlug];
}

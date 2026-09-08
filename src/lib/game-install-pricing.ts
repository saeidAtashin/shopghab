export type PriceRange = {
  min: number;
  max: number;
};

type PriceItem = {
  label: string;
  priceRangeToman: PriceRange;
};

export const GAME_INSTALL_PRICE_DATA = {
  accountCapacityInstallation: {
    title: "نصب با اکانت ظرفیتی/اشتراکی",
    notes:
      "اکانت‌های ظرفیتی یا اشتراکی، امکان محدودیت آنلاین یا حذف دسترسی وجود دارد.",
    items: [
      { label: "تک بازی", priceRangeToman: { min: 1500000, max: 3500000 } },
      { label: "پکیج 5 بازی", priceRangeToman: { min: 5000000, max: 9000000 } },
      {
        label: "پکیج 10 بازی",
        priceRangeToman: { min: 3500000, max: 12000000 },
      },
    ] as PriceItem[],
  },
  economyPackagesRandomGames: {
    title: "پکیج اقتصادی (بازی تصادفی)",
    notes: "بازی‌ها انتخابی نیستند و به صورت تصادفی ارائه می‌شوند.",
    items: [
      { label: "پکیج 10 بازی", priceRangeToman: { min: 4000000, max: 5500000 } },
      { label: "پکیج 20 بازی", priceRangeToman: { min: 6000000, max: 9000000 } },
    ] as PriceItem[],
  },
  jailbreakOfflineInstallation: {
    title: "نصب آفلاین روی کنسول کپی خور",
    notes: "فقط روی کنسول‌های کپی خور (اغلب PS4)، بدون امکان آنلاین.",
    items: [
      { label: "تک بازی", priceRangeToman: { min: 250000, max: 350000 } },
      {
        label: "پکیج بازی عمده",
        priceRangeToman: { min: 3000000, max: 10000000 },
      },
    ] as PriceItem[],
  },
  xboxInstallation: {
    title: "نصب بازی Xbox",
    notes: "وابسته به اکانت Microsoft و امکان استفاده از Game Pass.",
    items: [
      { label: "تک بازی", priceRangeToman: { min: 1500000, max: 3000000 } },
      {
        label: "پکیج 5 تا 10 بازی",
        priceRangeToman: { min: 4000000, max: 10000000 },
      },
    ] as PriceItem[],
  },
  additionalServices: {
    title: "خدمات جانبی",
    items: [
      {
        label: "انتقال دیتا یا راه اندازی هارد اکسترنال",
        priceRangeToman: { min: 300000, max: 800000 },
      },
      {
        label: "راه اندازی و فعال سازی اکانت",
        priceRangeToman: { min: 200000, max: 500000 },
      },
      {
        label: "فعال سازی آنلاین / تنظیم DNS",
        priceRangeToman: { min: 0, max: 200000 },
      },
    ] as PriceItem[],
  },
} as const;

export const GAME_INSTALL_SUMMARY_TABLE = [
  {
    label: "تک بازی",
    range: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[0]
      .priceRangeToman,
  },
  {
    label: "پکیج 5 بازی",
    range: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[1]
      .priceRangeToman,
  },
  {
    label: "پکیج 10 بازی",
    range: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[2]
      .priceRangeToman,
  },
  {
    label: "تک بازی (کپی خور)",
    range: GAME_INSTALL_PRICE_DATA.jailbreakOfflineInstallation.items[0]
      .priceRangeToman,
  },
  {
    label: "پکیج (کپی خور)",
    range: GAME_INSTALL_PRICE_DATA.jailbreakOfflineInstallation.items[1]
      .priceRangeToman,
  },
] as const;

type HomeHighlight = {
  title: string;
  current: PriceRange;
};

const inflateRange = (range: PriceRange, ratio = 1.2): PriceRange => ({
  min: Math.round(range.min * ratio),
  max: Math.round(range.max * ratio),
});

export const HOME_GAME_INSTALL_TABS = {
  ps4: {
    title: "تعرفه نصب بازی PS4",
    description:
      "PS4 بیشترین تنوع روش نصب را دارد؛ از نصب اکانتی تا نصب آفلاین کپی خور.",
    href: "/services/game-install/ps4",
    highlights: [
      {
        title: "تک بازی (اکانتی)",
        current: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[0]
          .priceRangeToman,
      },
      {
        title: "پکیج 5 بازی",
        current: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[1]
          .priceRangeToman,
      },
      {
        title: "نصب آفلاین (کپی خور)",
        current: GAME_INSTALL_PRICE_DATA.jailbreakOfflineInstallation.items[0]
          .priceRangeToman,
      },
      {
        title: "پکیج کپی خور",
        current: GAME_INSTALL_PRICE_DATA.jailbreakOfflineInstallation.items[1]
          .priceRangeToman,
      },
    ] as HomeHighlight[],
  },
  ps5: {
    title: "تعرفه نصب بازی PS5",
    description:
      "روی PS5 تمرکز اصلی روی نصب اکانتی و پکیج‌های انتخابی یا اقتصادی است.",
    href: "/services/game-install/ps5",
    highlights: [
      {
        title: "تک بازی",
        current: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[0]
          .priceRangeToman,
      },
      {
        title: "پکیج 5 بازی",
        current: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[1]
          .priceRangeToman,
      },
      {
        title: "پکیج 10 بازی",
        current: GAME_INSTALL_PRICE_DATA.accountCapacityInstallation.items[2]
          .priceRangeToman,
      },
      {
        title: "پکیج اقتصادی",
        current: GAME_INSTALL_PRICE_DATA.economyPackagesRandomGames.items[0]
          .priceRangeToman,
      },
    ] as HomeHighlight[],
  },
  xbox: {
    title: "تعرفه نصب بازی Xbox",
    description:
      "هزینه نصب Xbox وابسته به اکانت Microsoft، Game Pass و تعداد بازی است.",
    href: "/services/game-install/xbox-series",
    highlights: [
      {
        title: "تک بازی",
        current: GAME_INSTALL_PRICE_DATA.xboxInstallation.items[0].priceRangeToman,
      },
      {
        title: "پکیج 5 تا 10 بازی",
        current: GAME_INSTALL_PRICE_DATA.xboxInstallation.items[1].priceRangeToman,
      },
      {
        title: "راه اندازی اکانت",
        current: GAME_INSTALL_PRICE_DATA.additionalServices.items[1].priceRangeToman,
      },
      {
        title: "انتقال دیتا",
        current: GAME_INSTALL_PRICE_DATA.additionalServices.items[0].priceRangeToman,
      },
    ] as HomeHighlight[],
  },
} as const;

export type HomeGameInstallTab = keyof typeof HOME_GAME_INSTALL_TABS;

export const HOME_GAME_INSTALL_DISCOUNTED = {
  ps4: {
    ...HOME_GAME_INSTALL_TABS.ps4,
    highlights: HOME_GAME_INSTALL_TABS.ps4.highlights.map((item) => ({
      ...item,
      previous: inflateRange(item.current),
    })),
  },
  ps5: {
    ...HOME_GAME_INSTALL_TABS.ps5,
    highlights: HOME_GAME_INSTALL_TABS.ps5.highlights.map((item) => ({
      ...item,
      previous: inflateRange(item.current),
    })),
  },
  xbox: {
    ...HOME_GAME_INSTALL_TABS.xbox,
    highlights: HOME_GAME_INSTALL_TABS.xbox.highlights.map((item) => ({
      ...item,
      previous: inflateRange(item.current),
    })),
  },
} as const;

export const formatToman = (value: number): string => {
  if (value === 0) return "رایگان";
  const unit = getPriceUnit(value);
  return `${formatValueOnly(value, unit)} ${unitLabel(unit)}`;
};

export const formatRangeToman = (range: PriceRange): string => {
  if (range.min === range.max) return formatToman(range.min);
  if (range.min === 0) return `تا ${formatToman(range.max)}`;

  const minUnit = getPriceUnit(range.min);
  const maxUnit = getPriceUnit(range.max);

  if (minUnit === maxUnit && minUnit !== "toman") {
    return `${formatValueOnly(range.min, minUnit)} - ${formatValueOnly(range.max, maxUnit)} ${unitLabel(maxUnit)}`;
  }

  return `${formatToman(range.min)} - ${formatToman(range.max)}`;
};

type PriceUnit = "million" | "thousand" | "toman";

function getPriceUnit(value: number): PriceUnit {
  if (value >= 1_000_000) return "million";
  if (value >= 1_000) return "thousand";
  return "toman";
}

function unitLabel(unit: PriceUnit): string {
  if (unit === "million") return "میلیون تومان";
  if (unit === "thousand") return "هزار تومان";
  return "تومان";
}

function formatValueOnly(value: number, unit: PriceUnit): string {
  if (unit === "million") {
    return formatCompactNumber(value / 1_000_000);
  }
  if (unit === "thousand") {
    return formatCompactNumber(value / 1_000);
  }
  return value.toLocaleString("fa-IR");
}

function formatCompactNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString("fa-IR");
  }
  return value.toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
}

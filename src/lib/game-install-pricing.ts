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
  summaryTable: [
    { label: "تک بازی", rangeText: "1.5M - 3.5M" },
    { label: "پکیج 5 بازی", rangeText: "5M - 9M" },
    { label: "پکیج 10 بازی", rangeText: "3.5M - 12M" },
    { label: "تک بازی (کپی خور)", rangeText: "250K - 350K" },
    { label: "پکیج (کپی خور)", rangeText: "3M - 10M" },
  ],
} as const;

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

export const formatRangeCompact = (range: PriceRange): string => {
  const toCompact = (value: number) => {
    if (value >= 1_000_000) {
      const million = value / 1_000_000;
      return `${Number.isInteger(million) ? million : million.toFixed(1)}M`;
    }
    if (value >= 1_000) {
      const thousand = value / 1_000;
      return `${Number.isInteger(thousand) ? thousand : thousand.toFixed(0)}K`;
    }
    return String(value);
  };
  return `${toCompact(range.min)} - ${toCompact(range.max)}`;
};

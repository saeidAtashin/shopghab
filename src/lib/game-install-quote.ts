import {
  formatRangeToman,
  GAME_INSTALL_PRICE_DATA,
  type PriceRange,
} from "@/lib/game-install-pricing";

export type InstallMethodId =
  | "accountCapacityInstallation"
  | "jailbreakOfflineInstallation"
  | "xboxInstallation";

export type InstallPricingTier = {
  gameCount: number;
  label: string;
  range: PriceRange;
  previousRange: PriceRange;
};

export type InstallQuote = {
  methodId: InstallMethodId;
  methodLabel: string;
  selectedCount: number;
  tier: InstallPricingTier;
  priceLabel: string;
  discountPercent: number;
  exceedsMaxTier: boolean;
  upgradeHint: {
    gamesToAdd: number;
    nextTierLabel: string;
    nextTierCount: number;
    savingsMin: number;
    savingsMax: number;
  } | null;
};

const METHOD_LABELS: Record<InstallMethodId, string> = {
  accountCapacityInstallation: "نصب اکانتی / ظرفیتی",
  jailbreakOfflineInstallation: "نصب آفلاین (کپی‌خور)",
  xboxInstallation: "نصب Xbox",
};

const CONSOLE_METHODS: Record<string, InstallMethodId[]> = {
  ps5: ["accountCapacityInstallation"],
  ps4: ["accountCapacityInstallation", "jailbreakOfflineInstallation"],
  "xbox-one": ["accountCapacityInstallation", "xboxInstallation"],
  "xbox-series": ["accountCapacityInstallation", "xboxInstallation"],
};

function inflateRange(range: PriceRange, ratio = 1.2): PriceRange {
  return {
    min: Math.round(range.min * ratio),
    max: Math.round(range.max * ratio),
  };
}

function parseGameCount(label: string): number | null {
  const persianDigits = label.replace(/[۰-۹]/g, (d) =>
    String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
  );
  if (/تک\s*بازی|تکی|۱\s*بازی|1\s*بازی/.test(persianDigits)) return 1;
  if (/عمده|bulk/i.test(persianDigits)) return 10;
  const fiveTen = persianDigits.match(/۵\s*تا\s*۱۰|5\s*تا\s*10/);
  if (fiveTen) return 10;
  const match = persianDigits.match(/(\d+)/);
  if (!match) return /پکیج/.test(persianDigits) ? 10 : null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getInstallMethodsForConsole(
  consoleSlug: string,
): { id: InstallMethodId; label: string }[] {
  return (CONSOLE_METHODS[consoleSlug] ?? ["accountCapacityInstallation"]).map(
    (id) => ({
      id,
      label: METHOD_LABELS[id],
    }),
  );
}

export function getDefaultInstallMethod(consoleSlug: string): InstallMethodId {
  return getInstallMethodsForConsole(consoleSlug)[0]?.id ?? "accountCapacityInstallation";
}

export function isValidInstallMethod(
  consoleSlug: string,
  methodId: string,
): methodId is InstallMethodId {
  return getInstallMethodsForConsole(consoleSlug).some((m) => m.id === methodId);
}

export function getPricingTiers(methodId: InstallMethodId): InstallPricingTier[] {
  const section = GAME_INSTALL_PRICE_DATA[methodId];
  const tiers: InstallPricingTier[] = [];

  for (const item of section.items) {
    const gameCount = parseGameCount(item.label);
    if (gameCount == null) continue;
    tiers.push({
      gameCount,
      label: item.label,
      range: item.priceRangeToman,
      previousRange: inflateRange(item.priceRangeToman),
    });
  }

  return tiers.sort((a, b) => a.gameCount - b.gameCount);
}

function calcDiscountPercent(current: PriceRange, previous: PriceRange): number {
  const currentMid = (current.min + current.max) / 2;
  const previousMid = (previous.min + previous.max) / 2;
  if (previousMid <= 0) return 0;
  return Math.max(0, Math.round(((previousMid - currentMid) / previousMid) * 100));
}

function estimatePerGameCost(count: number, singleMin: number): number {
  return count * singleMin;
}

export function calculateInstallQuote(
  methodId: InstallMethodId,
  selectedCount: number,
): InstallQuote | null {
  const tiers = getPricingTiers(methodId);
  if (tiers.length === 0) return null;

  const count = Math.max(0, selectedCount);
  const singleTier = tiers[0];
  const maxTier = tiers[tiers.length - 1];

  let tier = tiers.find((t) => t.gameCount >= count) ?? maxTier;
  const exceedsMaxTier = count > maxTier.gameCount;

  let priceLabel: string;
  if (count === 0) {
    priceLabel = "بازی انتخاب کنید";
  } else if (count === 1 && tier.gameCount === 1) {
    priceLabel = formatRangeToman(tier.range);
  } else if (tier.gameCount === 1 && count > 1) {
    priceLabel = `${formatRangeToman({
      min: singleTier.range.min * count,
      max: singleTier.range.max * count,
    })} (برآورد ${count} بازی تکی)`;
    tier = singleTier;
  } else {
    priceLabel = formatRangeToman(tier.range);
  }

  const nextTier = tiers.find((t) => t.gameCount > count);
  let upgradeHint: InstallQuote["upgradeHint"] = null;

  if (count > 0 && nextTier && count < nextTier.gameCount) {
    const perGameCost = estimatePerGameCost(count, singleTier.range.min);
    const perGameCostMax = estimatePerGameCost(count, singleTier.range.max);
    const savingsMin = perGameCost - nextTier.range.max;
    const savingsMax = perGameCostMax - nextTier.range.min;

    if (nextTier.range.min < perGameCost) {
      upgradeHint = {
        gamesToAdd: nextTier.gameCount - count,
        nextTierLabel: nextTier.label,
        nextTierCount: nextTier.gameCount,
        savingsMin: Math.max(0, savingsMin),
        savingsMax: Math.max(0, savingsMax),
      };
    }
  }

  return {
    methodId,
    methodLabel: METHOD_LABELS[methodId],
    selectedCount: count,
    tier,
    priceLabel,
    discountPercent: calcDiscountPercent(tier.range, tier.previousRange),
    exceedsMaxTier,
    upgradeHint,
  };
}

export function formatQuoteSummary(quote: InstallQuote | null): string {
  if (!quote || quote.selectedCount === 0) return "";
  const parts = [
    `روش نصب: ${quote.methodLabel}`,
    `تعداد: ${quote.selectedCount.toLocaleString("fa-IR")} بازی`,
    `برآورد: ${quote.priceLabel}`,
  ];
  if (quote.exceedsMaxTier) {
    parts.push("تعداد بازی بیش از پکیج استاندارد — هماهنگی تلفنی");
  }
  return parts.join(" | ");
}

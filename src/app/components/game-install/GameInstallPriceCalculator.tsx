"use client";

import { Flame, Sparkles, TrendingDown } from "lucide-react";

import { useInstallMethodId } from "@/app/hooks/useInstallMethod";
import { useInstallGameList } from "@/app/hooks/useInstallGameList";
import {
  calculateInstallQuote,
} from "@/lib/game-install-quote";
import { formatRangeToman, formatToman } from "@/lib/game-install-pricing";

type Props = {
  consoleSlug: string;
  className?: string;
};

export default function GameInstallPriceCalculator({
  consoleSlug,
  className = "",
}: Props) {
  const methodId = useInstallMethodId(consoleSlug);
  const selectedGames = useInstallGameList(consoleSlug);
  const count = selectedGames.length;
  const quote = calculateInstallQuote(methodId, count);

  if (!quote) return null;

  return (
    <div
      className={`rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 md:p-6 ${className}`}
      aria-live="polite"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            برآورد هزینه
          </p>
          <p className="text-sm text-muted">
            {quote.methodLabel}
            {count > 0 ? (
              <>
                {" "}
                · {count.toLocaleString("fa-IR")} بازی انتخاب‌شده
              </>
            ) : null}
          </p>
        </div>
        {quote.discountPercent > 0 && count > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            تا {quote.discountPercent.toLocaleString("fa-IR")}٪ تخفیف
          </span>
        ) : null}
      </div>

      <p className="text-2xl font-black text-amber-100 md:text-3xl">
        {quote.priceLabel}
      </p>

      {count > 0 && quote.discountPercent > 0 ? (
        <p className="mt-2 text-sm text-muted line-through">
          قبل: {formatRangeToman(quote.tier.previousRange)}
        </p>
      ) : null}

      {quote.exceedsMaxTier ? (
        <p className="mt-3 rounded-xl border border-amber-500/30 bg-surface px-4 py-3 text-sm text-amber-100">
          تعداد بازی بیش از پکیج استاندارد است — برای قیمت دقیق با ما تماس
          بگیرید.
        </p>
      ) : null}

      {quote.upgradeHint ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
          <TrendingDown
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
            aria-hidden
          />
          <p className="text-sm leading-7 text-emerald-100">
            با افزودن{" "}
            <strong>
              {quote.upgradeHint.gamesToAdd.toLocaleString("fa-IR")} بازی
            </strong>{" "}
            دیگر به {quote.upgradeHint.nextTierLabel} برسید
            {quote.upgradeHint.savingsMin > 0 ? (
              <>
                {" "}
                و حداقل{" "}
                <strong>{formatToman(quote.upgradeHint.savingsMin)}</strong>
                {quote.upgradeHint.savingsMax > quote.upgradeHint.savingsMin ? (
                  <>
                    {" "}
                    تا {formatToman(quote.upgradeHint.savingsMax)}
                  </>
                ) : null}{" "}
                کمتر بپردازید.
              </>
            ) : (
              "."
            )}
          </p>
        </div>
      ) : null}

      {count === 0 ? (
        <p className="mt-3 text-sm text-muted">
          بازی‌ها را از لیست پایین انتخاب کنید تا قیمت محاسبه شود.
        </p>
      ) : null}
    </div>
  );
}

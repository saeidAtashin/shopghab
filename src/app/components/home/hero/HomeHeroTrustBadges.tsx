import { Palette, Smartphone, Sparkles, Truck } from "lucide-react";

import { HERO_TRUST_BADGES, type HeroTrustIcon } from "./hero.constants";

const ICONS: Record<HeroTrustIcon, typeof Palette> = {
  Palette,
  Sparkles,
  Truck,
  Smartphone,
};

type Props = {
  variant?: "default" | "onDark";
};

export default function HomeHeroTrustBadges({ variant = "default" }: Props) {
  const onDark = variant === "onDark";

  return (
    <ul className="grid grid-cols-2 gap-3" aria-label="مزایای قاب‌کده">
      {HERO_TRUST_BADGES.map((badge) => {
        const Icon = ICONS[badge.icon];
        return (
          <li
            key={badge.label}
            className={
              onDark
                ? "flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/15"
                : "flex items-center gap-2.5 rounded-2xl border border-border bg-card/50 px-3.5 py-3 backdrop-blur-xl transition hover:border-cyan-500/30 hover:bg-card/70 dark:bg-white/3"
            }
          >
            <span
              className={
                onDark
                  ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300"
                  : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span
              className={
                onDark
                  ? "text-xs font-semibold leading-snug text-white sm:text-sm"
                  : "text-xs font-semibold leading-snug text-foreground sm:text-sm"
              }
            >
              {badge.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

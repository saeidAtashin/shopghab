import { Star } from "lucide-react";

import { HERO_RATING } from "./hero.constants";

type Props = {
  variant?: "default" | "onDark";
};

export default function HomeHeroRating({ variant = "default" }: Props) {
  const onDark = variant === "onDark";

  return (
    <div
      className={
        onDark
          ? "flex flex-wrap items-center gap-3 text-sm text-white/70"
          : "flex flex-wrap items-center gap-3 text-sm text-muted"
      }
      aria-label={`${HERO_RATING.label}، ${HERO_RATING.score} از ۵`}
    >
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-amber-400 text-amber-400"
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className={onDark ? "font-semibold text-white" : "font-semibold text-foreground"}>
        {HERO_RATING.score}
      </span>
      <span>{HERO_RATING.label}</span>
    </div>
  );
}

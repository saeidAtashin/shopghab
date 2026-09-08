import { Truck } from "lucide-react";

import { HERO_BADGE } from "./hero.constants";

type Props = {
  variant?: "default" | "onDark";
};

export default function HomeHeroBadge({ variant = "default" }: Props) {
  const onDark = variant === "onDark";

  return (
    <div
      className={
        onDark
          ? "inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-xl"
          : "inline-flex items-center gap-2.5 rounded-full border border-cyan-500/20 bg-card/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-xl dark:border-cyan-400/25 dark:bg-white/[0.04]"
      }
    >
      <span
        className={
          onDark
            ? "flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300"
            : "flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
        }
      >
        <Truck className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span>{HERO_BADGE}</span>
    </div>
  );
}

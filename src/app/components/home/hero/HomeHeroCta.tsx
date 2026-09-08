import Link from "next/link";
import { Palette, Sparkles } from "lucide-react";

import MagneticLink from "@/app/components/ui/MagneticLink";
import { HERO_CTAS } from "./hero.constants";

type Props = {
  variant?: "default" | "onDark";
};

export default function HomeHeroCta({ variant = "default" }: Props) {
  const onDark = variant === "onDark";

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <MagneticLink
        href={HERO_CTAS.primary.href}
        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Palette className="h-4 w-4" aria-hidden />
        {HERO_CTAS.primary.label}
      </MagneticLink>

      <Link
        href={HERO_CTAS.secondary.href}
        className={
          onDark
            ? "inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition hover:border-cyan-400/50 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            : "inline-flex items-center gap-2 rounded-2xl border border-border bg-card/50 px-7 py-3.5 text-sm font-bold text-foreground backdrop-blur-xl transition hover:border-cyan-500/40 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        }
      >
        <Sparkles className="h-4 w-4 text-cyan-500" aria-hidden />
        {HERO_CTAS.secondary.label}
      </Link>
    </div>
  );
}

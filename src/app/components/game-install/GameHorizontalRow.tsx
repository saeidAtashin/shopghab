import Link from "next/link";
import { ArrowLeft, ChevronLeft, Sparkles } from "lucide-react";

import GameCard from "@/app/components/game-install/GameCard";
import { gameListPath } from "@/lib/game-filters";
import type { GameFilterId } from "@/lib/game-filters";
import { GAME_FILTERS } from "@/lib/game-filters";
import type { RawgGame } from "@/lib/rawg";

type Props = {
  title: string;
  filter: GameFilterId;
  consoleSlug: string;
  games: RawgGame[];
};

export default function GameHorizontalRow({
  title,
  filter,
  consoleSlug,
  games,
}: Props) {
  if (games.length === 0) return null;

  const filterMeta = GAME_FILTERS[filter];

  return (
    <section
      className="group/row relative mb-14 scroll-mt-28"
      aria-label={title}
    >
      <div
        className="pointer-events-none absolute -inset-x-2 -top-2 h-28 rounded-3xl bg-gradient-to-b from-cyan-500/[0.07] via-violet-500/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover/row:opacity-100"
        aria-hidden
      />

      <header className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400"
              aria-hidden
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium tracking-wide text-cyan-400/80">
              {filterMeta.description}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white md:text-[1.65rem]">
              {title}
            </h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
              {games.length.toLocaleString("fa-IR")} بازی
            </span>
          </div>
        </div>

        <Link
          href={gameListPath(consoleSlug, filter)}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300 shadow-[0_0_24px_-6px_rgba(34,211,238,0.35)] transition hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-white sm:self-auto"
        >
          <span>مشاهده همه</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </span>
        </Link>
      </header>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-10 bg-gradient-to-l from-[#050816] to-transparent sm:w-14"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-10 bg-gradient-to-r from-[#050816] to-transparent sm:w-14"
          aria-hidden
        />

        <div className="snap-x snap-mandatory overflow-x-auto pb-3 [scrollbar-color:rgba(34,211,238,0.35)_transparent] [scrollbar-width:thin]">
          <div className="flex gap-4 px-0.5 sm:gap-5">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                consoleSlug={consoleSlug}
                showAddButton
              />
            ))}
          </div>
        </div>

        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600 sm:justify-end">
          <ArrowLeft className="h-3 w-3 opacity-60" aria-hidden />
          برای دیدن بیشتر بکشید
        </p>
      </div>
    </section>
  );
}

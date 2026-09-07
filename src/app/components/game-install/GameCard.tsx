import Image from "next/image";
import { Star } from "lucide-react";

import AddToGameListButton from "@/app/components/game-install/AddToGameListButton";
import type { RawgGame } from "@/lib/rawg";

type Props = {
  game: RawgGame;
  consoleSlug?: string;
  showAddButton?: boolean;
  className?: string;
};

export default function GameCard({
  game,
  consoleSlug,
  showAddButton = false,
  className = "",
}: Props) {
  return (
    <article
      className={`group/card flex w-[172px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/35 hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.15)] sm:w-[192px] ${className}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        {game.backgroundImage ? (
          <Image
            src={game.backgroundImage}
            alt=""
            fill
            sizes="192px"
            className="object-cover transition duration-500 group-hover/card:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-600">
            بدون تصویر
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/20 to-transparent opacity-90"
          aria-hidden
        />
        {game.rating != null ? (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/55 px-2 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
            {game.rating.toFixed(1)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 pt-2">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-100">
          {game.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
          {game.released ? (
            <time dateTime={game.released}>
              {new Date(game.released).toLocaleDateString("fa-IR", {
                year: "numeric",
              })}
            </time>
          ) : null}
          {game.metacritic != null ? (
            <span className="text-zinc-600">
              {game.released ? "· " : ""}
              <span className="text-violet-400/90">{game.metacritic}</span> MC
            </span>
          ) : null}
        </div>
        {showAddButton && consoleSlug ? (
          <AddToGameListButton
            game={game}
            consoleSlug={consoleSlug}
            className="mt-auto"
          />
        ) : null}
      </div>
    </article>
  );
}

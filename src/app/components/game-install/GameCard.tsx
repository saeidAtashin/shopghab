"use client";

import { useRef } from "react";
import { Star } from "lucide-react";

import AddToGameListButton from "@/app/components/game-install/AddToGameListButton";
import { useGameInstallList } from "@/app/context/GameInstallListContext";
import GameImageStrip from "@/app/components/ui/GameImageStrip";
import type { InstallCatalogGame } from "@/lib/game-install-catalog";
import { getInstallCatalogConsoleLabel } from "@/lib/game-install-catalog";
import { resolveGameImages } from "@/lib/game-images";
import { cn } from "@/lib/utils";

type Props = {
  game: InstallCatalogGame;
  consoleSlug?: string;
  showAddButton?: boolean;
  className?: string;
  layout?: "carousel" | "grid";
};

export default function GameCard({
  game,
  consoleSlug,
  showAddButton = false,
  className = "",
  layout = "carousel",
}: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const { flyingGameId } = useGameInstallList();
  const isFlying = flyingGameId === game.id;

  const { images } = resolveGameImages({
    slug: game.slug,
    name: game.name,
    fallback: game.coverImage,
  });

  const layoutClass =
    layout === "grid"
      ? "w-full"
      : "w-[172px] shrink-0 snap-start sm:w-[192px]";

  const imageSizes =
    layout === "grid"
      ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      : "192px";

  return (
    <article
      ref={cardRef}
      className={cn(
        "group/card flex flex-col overflow-hidden rounded-3xl border border-border bg-card/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-[0_16px_48px_-12px_rgba(34,211,238,0.25)]",
        layout === "grid" &&
          "hover:shadow-[0_16px_48px_-12px_rgba(34,211,238,0.3)]",
        isFlying && "pointer-events-none opacity-0",
        layoutClass,
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-background">
        <GameImageStrip
          images={images}
          alt={game.name}
          sizes={imageSizes}
          aspectClass="h-full w-full"
          className="absolute inset-0"
          imageClassName="object-cover transition duration-500 group-hover/card:scale-105"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/25 to-transparent"
          aria-hidden
        />
        {game.rating != null ? (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-background/60 px-2 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
            {game.rating.toFixed(1)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground sm:text-[15px]">
          {game.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
            {getInstallCatalogConsoleLabel(game.console)}
          </span>
          {game.genre ? <span>{game.genre}</span> : null}
          {game.metacritic != null ? (
            <span className="text-muted">
              · <span className="text-violet-400/90">{game.metacritic}</span> MC
            </span>
          ) : null}
        </div>
        {showAddButton && consoleSlug ? (
          <AddToGameListButton
            game={game}
            consoleSlug={consoleSlug}
            animationSourceRef={cardRef}
            className="mt-auto"
          />
        ) : null}
      </div>
    </article>
  );
}

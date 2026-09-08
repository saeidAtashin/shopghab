import AddToGameListButton from "@/app/components/game-install/AddToGameListButton";
import GameImageStrip from "@/app/components/ui/GameImageStrip";
import type { InstallCatalogGame } from "@/lib/game-install-catalog";
import { getInstallCatalogConsoleLabel } from "@/lib/game-install-catalog";
import { resolveGameImages } from "@/lib/game-images";

type Props = {
  games: InstallCatalogGame[];
  totalCount: number;
  consoleSlug: string;
};

export default function GameListGrid({ games, totalCount, consoleSlug }: Props) {
  if (games.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-muted">
        بازی‌ای یافت نشد.
      </p>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted">
        {totalCount.toLocaleString("fa-IR")} بازی — نمایش{" "}
        {games.length.toLocaleString("fa-IR")} مورد
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game, index) => {
          const { images } = resolveGameImages({
            slug: game.slug,
            name: game.name,
            fallback: game.coverImage,
          });
          const isPriority = index < 4;

          return (
            <li
              key={game.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-cyan-400/30 hover:bg-white/[0.07]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-card">
                <GameImageStrip
                  images={images}
                  alt={game.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  aspectClass="h-full w-full"
                  className="absolute inset-0"
                  imageClassName="object-cover transition duration-300 group-hover:scale-105"
                  priority={isPriority}
                  fetchPriority={isPriority ? "high" : "auto"}
                />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 font-bold leading-snug">
                  {game.name}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {getInstallCatalogConsoleLabel(game.console)} · {game.genre}
                </p>
                {game.rating != null ? (
                  <p className="mt-2 text-sm text-cyan-400/90">
                    امتیاز: {game.rating.toFixed(1)}
                    {game.metacritic != null ? (
                      <span className="text-muted">
                        {" "}
                        · متاکریتیک {game.metacritic}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                <AddToGameListButton
                  game={game}
                  consoleSlug={consoleSlug}
                  className="mt-auto pt-3"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

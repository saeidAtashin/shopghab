import Image from "next/image";

import type { RawgGame } from "@/lib/rawg";

type Props = {
  games: RawgGame[];
  totalCount: number;
};

export default function GameListGrid({ games, totalCount }: Props) {
  if (games.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-zinc-400">
        بازی‌ای یافت نشد.
      </p>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-zinc-500">
        {totalCount.toLocaleString("fa-IR")} بازی — نمایش{" "}
        {games.length.toLocaleString("fa-IR")} مورد در این صفحه
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <li
            key={game.id}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-cyan-400/30 hover:bg-white/[0.07]"
          >
            <div className="relative aspect-[16/10] bg-zinc-900">
              {game.backgroundImage ? (
                <Image
                  src={game.backgroundImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  بدون تصویر
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="line-clamp-2 font-bold leading-snug">
                {game.name}
              </h2>
              {game.released ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(game.released).toLocaleDateString("fa-IR", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              ) : null}
              {game.rating != null ? (
                <p className="mt-2 text-sm text-cyan-400/90">
                  امتیاز: {game.rating.toFixed(1)}
                  {game.metacritic != null ? (
                    <span className="text-zinc-500">
                      {" "}
                      · متاکریتیک {game.metacritic}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

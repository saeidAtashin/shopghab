"use client";

import Image from "next/image";
import { Gamepad2, Trash2 } from "lucide-react";

import type { InstallListGame } from "@/lib/game-install-list";
import { resolveGameImages } from "@/lib/game-images";

type Props = {
  game: InstallListGame;
  index: number;
  onRemove: (gameId: string) => void;
};

export default function InstallListGameItem({ game, index, onRemove }: Props) {
  const { images, coverImage } = resolveGameImages({
    slug: game.slug,
    name: game.name,
    fallback: game.backgroundImage,
  });
  const imageSrc = images[0] ?? coverImage;

  return (
    <li className="group flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-2 transition hover:border-emerald-400/40 hover:bg-emerald-500/15">
      <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded-md bg-card">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="32px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-background text-muted">
            <Gamepad2 className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[11px] font-bold leading-tight text-foreground sm:text-xs">
          <span className="me-1 text-emerald-400/80">
            {(index + 1).toLocaleString("fa-IR")}.
          </span>
          {game.name}
        </p>
        {game.custom ? (
          <span className="text-[9px] text-muted">دلخواه</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onRemove(game.id)}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/25"
        aria-label={`حذف ${game.name}`}
      >
        <Trash2 className="h-3 w-3" aria-hidden />
      </button>
    </li>
  );
}

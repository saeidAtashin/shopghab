"use client";

import { Check, ListPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  addToInstallGameList,
  isInInstallGameList,
  removeFromInstallGameList,
  toInstallListGame,
} from "@/lib/game-install-list";
import type { RawgGame } from "@/lib/rawg";

type Props = {
  game: RawgGame;
  consoleSlug: string;
  className?: string;
};

export default function AddToGameListButton({
  game,
  consoleSlug,
  className = "",
}: Props) {
  const [inList, setInList] = useState(false);
  const [pulse, setPulse] = useState(false);

  const sync = useCallback(() => {
    setInList(isInInstallGameList(game.id));
  }, [game.id]);

  useEffect(() => {
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "game-install-list") sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [sync]);

  const toggle = () => {
    if (inList) {
      removeFromInstallGameList(game.id);
      setInList(false);
      return;
    }
    const added = addToInstallGameList(toInstallListGame(game, consoleSlug));
    if (added) {
      setInList(true);
      setPulse(true);
      window.setTimeout(() => setPulse(false), 600);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={inList}
      className={`group/btn relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-300 ${
        inList
          ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
          : "border border-cyan-400/25 bg-cyan-500/10 text-cyan-200 hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-white"
      } ${pulse ? "scale-[1.02] ring-2 ring-emerald-400/50" : ""} ${className}`}
    >
      {!inList ? (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full"
          aria-hidden
        />
      ) : null}
      {inList ? (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : (
        <ListPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      <span className="relative">{inList ? "در لیست شما" : "اضافه به لیست بازی‌ها"}</span>
    </button>
  );
}

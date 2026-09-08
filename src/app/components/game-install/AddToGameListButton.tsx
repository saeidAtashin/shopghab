"use client";

import { Check, ListPlus } from "lucide-react";
import { useCallback, useEffect, useState, type RefObject } from "react";

import { useGameInstallList } from "@/app/context/GameInstallListContext";
import {
  INSTALL_GAME_LIST_CHANGED_EVENT,
  isInInstallGameList,
  removeFromInstallGameList,
} from "@/lib/game-install-list";
import type { InstallCatalogGame } from "@/lib/game-install-catalog";

type Props = {
  game: InstallCatalogGame;
  consoleSlug: string;
  className?: string;
  animationSourceRef?: RefObject<HTMLElement | null>;
};

export default function AddToGameListButton({
  game,
  consoleSlug,
  className = "",
  animationSourceRef,
}: Props) {
  const { addGameWithAnimation, isFlyActive } = useGameInstallList();
  const [inList, setInList] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const sync = useCallback(() => {
    setInList(isInInstallGameList(game.id));
  }, [game.id]);

  useEffect(() => {
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "game-install-list") sync();
    };
    window.addEventListener(INSTALL_GAME_LIST_CHANGED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(INSTALL_GAME_LIST_CHANGED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [sync]);

  async function handleClick() {
    if (inList) {
      removeFromInstallGameList(game.id);
      setInList(false);
      return;
    }

    const added = await addGameWithAnimation(game, consoleSlug, {
      sourceElement: animationSourceRef?.current,
    });
    if (added) {
      setInList(true);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 900);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isFlyActive}
      aria-pressed={inList}
      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 sm:text-sm ${
        inList
          ? justAdded
            ? "bg-emerald-400 text-black shadow-[0_0_0_10px_rgba(34,211,238,0)] animate-pulse"
            : "border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
          : "bg-cyan-500 text-black hover:bg-cyan-400"
      } ${className}`}
    >
      {inList ? (
        <Check className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
      ) : (
        <ListPlus className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
      )}
      <span>
        {inList ? (justAdded ? "اضافه شد" : "در لیست شما") : "اضافه به لیست بازی‌ها"}
      </span>
    </button>
  );
}

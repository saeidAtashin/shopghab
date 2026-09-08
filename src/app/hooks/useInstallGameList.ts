"use client";

import { useCallback, useEffect, useState } from "react";

import {
  filterInstallGameList,
  INSTALL_GAME_LIST_CHANGED_EVENT,
  type InstallListGame,
} from "@/lib/game-install-list";

export function useInstallGameList(consoleSlug: string): InstallListGame[] {
  const readForConsole = useCallback(
    () => filterInstallGameList(consoleSlug),
    [consoleSlug],
  );

  const [games, setGames] = useState<InstallListGame[]>([]);

  useEffect(() => {
    setGames(readForConsole());

    const sync = () => setGames(readForConsole());

    window.addEventListener(INSTALL_GAME_LIST_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(INSTALL_GAME_LIST_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [readForConsole]);

  return games;
}

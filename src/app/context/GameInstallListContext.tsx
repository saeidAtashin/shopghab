"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import FlyToListAnimator from "@/app/components/game-install/FlyToListAnimator";
import ShopToast from "@/app/components/shop/ShopToast";
import type { InstallCatalogGame } from "@/lib/game-install-catalog";
import {
  addToInstallGameList,
  isInInstallGameList,
  toInstallListGame,
} from "@/lib/game-install-list";
import {
  getVisibleListTargetRect,
  isOrderPanelInViewport,
  LIST_RECEIVE_DURATION_MS,
  prefersReducedMotion,
  scrollBackTo,
  scrollToListTarget,
} from "@/lib/game-install/fly-to-list";
import { resolveGameImages } from "@/lib/game-images";

export type FlyToListAnimationState = {
  gameId: string;
  image: string;
  fromRect: DOMRect;
};

export type AddToGameListOptions = {
  sourceElement?: HTMLElement | null;
};

type GameInstallListContextValue = {
  toastMessage: string | null;
  flyAnimation: FlyToListAnimationState | null;
  flyingGameId: string | null;
  listBounce: boolean;
  isFlyActive: boolean;
  addGameWithAnimation: (
    game: InstallCatalogGame,
    consoleSlug: string,
    options?: AddToGameListOptions,
  ) => Promise<boolean>;
  dismissToast: () => void;
  completeFlyAnimation: () => void;
};

const GameInstallListContext = createContext<GameInstallListContextValue | null>(
  null,
);

export function GameInstallListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [flyAnimation, setFlyAnimation] = useState<FlyToListAnimationState | null>(
    null,
  );
  const [listBounce, setListBounce] = useState(false);
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyActiveRef = useRef(false);
  const pendingScrollYRef = useRef<number | null>(null);
  const hasAutoScrolledForAddRef = useRef(false);

  useEffect(() => {
    flyActiveRef.current = flyAnimation !== null;
  }, [flyAnimation]);

  useEffect(() => {
    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    };
  }, []);

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const triggerListBounce = useCallback(() => {
    setListBounce(true);
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    bounceTimerRef.current = setTimeout(() => {
      setListBounce(false);
      bounceTimerRef.current = null;
    }, LIST_RECEIVE_DURATION_MS);
  }, []);

  const completeFlyAnimation = useCallback(() => {
    flyActiveRef.current = false;
    setFlyAnimation(null);
    triggerListBounce();

    const savedY = pendingScrollYRef.current;
    pendingScrollYRef.current = null;
    if (savedY !== null) {
      void scrollBackTo(savedY);
    }
  }, [triggerListBounce]);

  const addGameWithAnimation = useCallback(
    async (
      game: InstallCatalogGame,
      consoleSlug: string,
      options?: AddToGameListOptions,
    ): Promise<boolean> => {
      if (flyActiveRef.current) return false;
      if (isInInstallGameList(game.id)) return false;

      const added = addToInstallGameList(toInstallListGame(game, consoleSlug));
      if (!added) return false;

      const sourceElement = options?.sourceElement;
      if (prefersReducedMotion() || !sourceElement) {
        setToastMessage(`${game.name} به لیست بازی‌ها اضافه شد`);
        return true;
      }

      const fromRect = sourceElement.getBoundingClientRect();
      const isFirstAnimatedAdd = !hasAutoScrolledForAddRef.current;
      const needsScroll = isFirstAnimatedAdd && !isOrderPanelInViewport();

      if (needsScroll) {
        pendingScrollYRef.current = window.scrollY;
        await scrollToListTarget();
      } else {
        pendingScrollYRef.current = null;
      }

      hasAutoScrolledForAddRef.current = true;

      const listRect = getVisibleListTargetRect();
      if (!listRect) {
        if (pendingScrollYRef.current !== null) {
          await scrollBackTo(pendingScrollYRef.current);
          pendingScrollYRef.current = null;
        }
        setToastMessage(`${game.name} به لیست بازی‌ها اضافه شد`);
        return true;
      }

      const { images } = resolveGameImages({
        slug: game.slug,
        name: game.name,
        fallback: game.coverImage,
      });

      setFlyAnimation({
        gameId: game.id,
        image: images[0] ?? game.coverImage,
        fromRect,
      });
      flyActiveRef.current = true;
      return true;
    },
    [],
  );

  const value = useMemo<GameInstallListContextValue>(
    () => ({
      toastMessage,
      flyAnimation,
      flyingGameId: flyAnimation?.gameId ?? null,
      listBounce,
      isFlyActive: flyAnimation !== null,
      addGameWithAnimation,
      dismissToast,
      completeFlyAnimation,
    }),
    [
      toastMessage,
      flyAnimation,
      listBounce,
      addGameWithAnimation,
      dismissToast,
      completeFlyAnimation,
    ],
  );

  return (
    <GameInstallListContext.Provider value={value}>
      {children}
      <FlyToListAnimator />
      <ShopToast message={toastMessage} onDismiss={dismissToast} />
    </GameInstallListContext.Provider>
  );
}

export function useGameInstallList() {
  const context = useContext(GameInstallListContext);
  if (!context) {
    throw new Error(
      "useGameInstallList must be used within GameInstallListProvider",
    );
  }
  return context;
}

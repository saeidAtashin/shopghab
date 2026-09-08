"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

import GameInstallListCountBadge from "@/app/components/game-install/GameInstallListCountBadge";
import { useGameInstallList } from "@/app/context/GameInstallListContext";
import { useGameInstallFabDock } from "@/app/hooks/useGameInstallFabDock";
import { useInstallGameList } from "@/app/hooks/useInstallGameList";

type Props = {
  consoleSlug: string;
  targetId?: string;
  label?: string;
};

const receiveTransition = {
  duration: 0.45,
  times: [0, 0.2, 0.55, 1],
  ease: "easeOut" as const,
};

const dockEase = [0.4, 0, 0.2, 1] as const;

export default function GameInstallOrderFab({
  consoleSlug,
  targetId = "game-install-order",
  label = "ثبت سفارش نصب",
}: Props) {
  const games = useInstallGameList(consoleSlug);
  const { listBounce } = useGameInstallList();
  const enabled = games.length > 0;
  const {
    fabRef,
    phase,
    dockFrom,
    dockTo,
    handleDockAnimationComplete,
  } = useGameInstallFabDock(enabled);

  if (!enabled) return null;

  const isDocking = phase === "docking" && dockFrom && dockTo;
  const bounceScale = listBounce && phase === "floating" ? [1, 0.96, 1.04, 1] : 1;

  if (isDocking) {
    return (
      <motion.a
        ref={fabRef}
        href={`#${targetId}`}
        initial={false}
        animate={{
          left: dockTo.left,
          top: dockTo.top,
          width: dockTo.width,
          height: dockTo.height,
          borderRadius: dockTo.borderRadius,
          opacity: 0,
        }}
        transition={{ duration: 0.42, ease: dockEase }}
        onAnimationComplete={handleDockAnimationComplete}
        style={{
          position: "fixed",
          left: dockFrom.left,
          top: dockFrom.top,
          width: dockFrom.width,
          height: dockFrom.height,
          borderRadius: dockFrom.borderRadius,
          zIndex: 50,
        }}
        className="flex items-center justify-center overflow-hidden border border-cyan-400/40 bg-cyan-500 text-sm font-bold text-black shadow-[0_8px_32px_-4px_rgba(34,211,238,0.55)]"
        aria-hidden
      >
        <span className="invisible flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
          <span>{label}</span>
        </span>
      </motion.a>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {phase !== "hidden" ? (
          <motion.a
            key="game-install-fab"
            ref={fabRef}
            href={`#${targetId}`}
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: bounceScale }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={
              listBounce
                ? receiveTransition
                : { duration: 0.28, ease: "easeOut" }
            }
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500 px-6 py-3.5 text-sm font-bold text-black shadow-[0_8px_32px_-4px_rgba(34,211,238,0.55)] transition-colors hover:bg-cyan-400 hover:shadow-[0_12px_40px_-4px_rgba(34,211,238,0.65)]"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
            <span>{label}</span>
            <GameInstallListCountBadge className="relative shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs">
              {games.length.toLocaleString("fa-IR")}
            </GameInstallListCountBadge>
          </motion.a>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

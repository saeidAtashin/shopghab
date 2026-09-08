"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  GAME_INSTALL_SUBMIT_TARGET_SELECTOR,
  INSTALL_FAB_DOCKED_EVENT,
  prefersReducedMotion,
} from "@/lib/game-install/fly-to-list";

export type FabDockRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: number;
};

export type FabPhase = "floating" | "docking" | "hidden";

function readDockRects(
  fabEl: HTMLElement,
  targetEl: HTMLElement,
): { from: FabDockRect; to: FabDockRect } {
  const fabRect = fabEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  return {
    from: {
      left: fabRect.left,
      top: fabRect.top,
      width: fabRect.width,
      height: fabRect.height,
      borderRadius: 9999,
    },
    to: {
      left: targetRect.left,
      top: targetRect.top,
      width: targetRect.width,
      height: targetRect.height,
      borderRadius: 16,
    },
  };
}

export function useGameInstallFabDock(enabled: boolean) {
  const fabRef = useRef<HTMLAnchorElement>(null);
  const [phase, setPhase] = useState<FabPhase>("floating");
  const [dockFrom, setDockFrom] = useState<FabDockRect | null>(null);
  const [dockTo, setDockTo] = useState<FabDockRect | null>(null);
  const phaseRef = useRef<FabPhase>("floating");
  const dockingRef = useRef(false);

  phaseRef.current = phase;

  const completeDock = useCallback(() => {
    dockingRef.current = false;
    setPhase("hidden");
    setDockFrom(null);
    setDockTo(null);
    window.dispatchEvent(new CustomEvent(INSTALL_FAB_DOCKED_EVENT));
  }, []);

  const startDock = useCallback(() => {
    const fab = fabRef.current;
    const target = document.querySelector(GAME_INSTALL_SUBMIT_TARGET_SELECTOR);
    if (!fab || !(target instanceof HTMLElement)) {
      setPhase("hidden");
      return;
    }

    if (prefersReducedMotion()) {
      setPhase("hidden");
      window.dispatchEvent(new CustomEvent(INSTALL_FAB_DOCKED_EVENT));
      return;
    }

    const { from, to } = readDockRects(fab, target);
    dockingRef.current = true;
    setDockFrom(from);
    setDockTo(to);
    setPhase("docking");
  }, []);

  const showFloating = useCallback(() => {
    dockingRef.current = false;
    setDockFrom(null);
    setDockTo(null);
    setPhase("floating");
  }, []);

  useEffect(() => {
    if (!enabled) {
      showFloating();
      return;
    }

    const target = document.querySelector(GAME_INSTALL_SUBMIT_TARGET_SELECTOR);
    if (!(target instanceof HTMLElement)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;

        if (visible) {
          if (phaseRef.current === "floating") startDock();
        } else if (phaseRef.current === "hidden") {
          showFloating();
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, startDock, showFloating]);

  const handleDockAnimationComplete = useCallback(() => {
    if (phaseRef.current === "docking" && dockingRef.current) {
      completeDock();
    }
  }, [completeDock]);

  return {
    fabRef,
    phase,
    dockFrom,
    dockTo,
    handleDockAnimationComplete,
  };
}

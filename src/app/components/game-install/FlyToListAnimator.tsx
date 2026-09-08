"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useGameInstallList } from "@/app/context/GameInstallListContext";
import {
  FLY_ANIMATION_CONFIG,
  getCenter,
  getVisibleListTargetRect,
} from "@/lib/game-install/fly-to-list";

export default function FlyToListAnimator() {
  const { flyAnimation, completeFlyAnimation } = useGameInstallList();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!flyAnimation) return;
    const listRect = getVisibleListTargetRect();
    if (!listRect) completeFlyAnimation();
  }, [flyAnimation, completeFlyAnimation]);

  if (!mounted || !flyAnimation) return null;

  const listRect = getVisibleListTargetRect();
  if (!listRect) return null;

  const { image, fromRect } = flyAnimation;
  const fromCenter = getCenter(fromRect);
  const toCenter = getCenter(listRect);
  const deltaX = toCenter.x - fromCenter.x;
  const deltaY = toCenter.y - fromCenter.y;
  const { popLiftY, arcOvershootY, popScale, landScale } = FLY_ANIMATION_CONFIG;

  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[250] overflow-hidden border border-border bg-card/60 will-change-transform"
      style={{
        top: fromRect.top,
        left: fromRect.left,
        width: fromRect.width,
        height: fromRect.height,
        transformOrigin: "center center",
      }}
      initial={{
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        borderRadius: 24,
        boxShadow: FLY_ANIMATION_CONFIG.noShadow,
      }}
      animate={{
        x: [0, 0, deltaX * 0.55, deltaX],
        y: [0, popLiftY, deltaY + arcOvershootY, deltaY],
        scale: [1, popScale, 0.15, landScale],
        opacity: [1, 1, 1, 0],
        borderRadius: [24, 24, 12, 8],
        boxShadow: [
          FLY_ANIMATION_CONFIG.noShadow,
          FLY_ANIMATION_CONFIG.popGlowShadow,
          FLY_ANIMATION_CONFIG.midShadow,
          FLY_ANIMATION_CONFIG.noShadow,
        ],
      }}
      transition={{
        duration: FLY_ANIMATION_CONFIG.duration,
        times: [...FLY_ANIMATION_CONFIG.times],
        ease: [...FLY_ANIMATION_CONFIG.ease],
      }}
      onAnimationComplete={completeFlyAnimation}
    >
      <div className="relative h-full w-full overflow-hidden bg-background">
        <Image src={image} alt="" fill sizes="400px" className="object-cover" />
      </div>
    </motion.div>,
    document.body,
  );
}

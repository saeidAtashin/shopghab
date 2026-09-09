"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useShopCart } from "@/app/context/ShopCartContext";
import {
  FLY_ANIMATION_CONFIG,
  getCenter,
  getVisibleCartRect,
} from "@/lib/shop/fly-to-cart";

export default function FlyToCartAnimator() {
  const { flyAnimation, completeFlyToCart } = useShopCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!flyAnimation) return;
    const cartRect = getVisibleCartRect();
    if (!cartRect) completeFlyToCart();
  }, [flyAnimation, completeFlyToCart]);

  if (!mounted || !flyAnimation) return null;

  const cartRect = getVisibleCartRect();
  if (!cartRect) return null;

  const { image, fromRect } = flyAnimation;
  const fromCenter = getCenter(fromRect);
  const toCenter = getCenter(cartRect);
  const deltaX = toCenter.x - fromCenter.x;
  const deltaY = toCenter.y - fromCenter.y;
  const { popLiftY, arcOvershootY, popScale, landScale } = FLY_ANIMATION_CONFIG;

  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[250] overflow-hidden border border-cyan-400/40 bg-card/80 will-change-transform"
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
      onAnimationComplete={completeFlyToCart}
    >
      <div className="relative h-full w-full overflow-hidden bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-contain" />
      </div>
    </motion.div>,
    document.body,
  );
}

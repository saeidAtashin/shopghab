export const SHOP_CART_TARGET_SELECTOR = "[data-shop-cart-target]";

export type FlyToCartVariant = "card" | "hero";

export type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type FlyToCartAnimationState = {
  image: string;
  fromRect: RectLike;
};

export function toRectLike(rect: DOMRectReadOnly): RectLike {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export const FLY_ANIMATION_CONFIG = {
  duration: 0.95,
  times: [0, 0.28, 0.65, 1] as const,
  ease: ["easeOut", "easeInOut", [0.45, 0, 0.15, 1]] as const,
  popLiftY: -10,
  arcOvershootY: -20,
  popScale: 1.1,
  landScale: 0.08,
  popGlowShadow: "0 16px 48px rgba(6,182,212,0.5)",
  midShadow: "0 8px 24px rgba(0,0,0,0.35)",
  noShadow: "0 0 0 rgba(0,0,0,0)",
} as const;

export const CART_RECEIVE_DURATION_MS = 500;

export function getCenter(rect: RectLike) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function getVisibleCartRect(): DOMRect | null {
  if (typeof document === "undefined") return null;

  const targets = document.querySelectorAll(SHOP_CART_TARGET_SELECTOR);
  for (const el of targets) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  return null;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

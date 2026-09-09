"use client";

import { useEffect } from "react";
import { useShopCart } from "@/app/context/ShopCartContext";

export default function AddToCartFeedback() {
  const { toastMessage, dismissAddToCartToast, checkoutPrompt } = useShopCart();

  useEffect(() => {
    if (!toastMessage || checkoutPrompt) return;
    const timer = setTimeout(dismissAddToCartToast, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage, checkoutPrompt, dismissAddToCartToast]);

  if (!toastMessage || checkoutPrompt) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[150] -translate-x-1/2 rounded-xl border border-cyan-500/30 bg-card px-5 py-3 text-sm font-medium text-foreground shadow-xl lg:bottom-8"
    >
      {toastMessage}
    </div>
  );
}

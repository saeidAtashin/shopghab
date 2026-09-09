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
import { AnimatePresence } from "framer-motion";

import AddToCartFeedback from "@/app/components/shop/AddToCartFeedback";
import CheckoutPromptModal, {
  type CheckoutPrompt,
} from "@/app/components/shop/CheckoutPromptModal";
import FlyToCartAnimator from "@/app/components/shop/FlyToCartAnimator";
import { getReadyCaseById } from "@/lib/cases/ready.static";
import {
  addCustomToCart,
  addReadyToCart,
  getCartCount,
  getCartSubtotal,
  readCartItems,
  removeCartItem,
  setCartItemQty,
  writeCartItems,
  type CartLineItem,
  type CustomCartLineItem,
} from "@/lib/shop/cart";
import {
  getVisibleCartRect,
  prefersReducedMotion,
  type FlyToCartAnimationState,
} from "@/lib/shop/fly-to-cart";
import { getCartItemKey } from "@/lib/shop/types";

export type AddToCartOptions = {
  deferPrompt?: boolean;
};

type ShopCartContextValue = {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  toastMessage: string | null;
  cartBounce: boolean;
  checkoutPrompt: CheckoutPrompt | null;
  flyAnimation: FlyToCartAnimationState | null;
  addReadyCase: (productId: string, title?: string) => void;
  addCustomCase: (
    item: Omit<CustomCartLineItem, "kind" | "qty">,
    options?: AddToCartOptions,
  ) => void;
  incrementQty: (key: string) => void;
  decrementQty: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  dismissAddToCartToast: () => void;
  dismissCheckoutPrompt: () => void;
  startFlyToCart: (payload: FlyToCartAnimationState) => Promise<void>;
  completeFlyToCart: () => void;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartBounce, setCartBounce] = useState(false);
  const [checkoutPrompt, setCheckoutPrompt] = useState<CheckoutPrompt | null>(
    null,
  );
  const [flyAnimation, setFlyAnimation] =
    useState<FlyToCartAnimationState | null>(null);
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPromptRef = useRef<CheckoutPrompt | null>(null);
  const flyResolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setItems(readCartItems());
  }, []);

  useEffect(() => {
    writeCartItems(items);
  }, [items]);

  useEffect(() => {
    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    };
  }, []);

  const dismissAddToCartToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const dismissCheckoutPrompt = useCallback(() => {
    setCheckoutPrompt(null);
    pendingPromptRef.current = null;
  }, []);

  const bounceCart = useCallback(() => {
    setCartBounce(true);
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    bounceTimerRef.current = setTimeout(() => {
      setCartBounce(false);
      bounceTimerRef.current = null;
    }, 450);
  }, []);

  const showPrompt = useCallback((prompt: CheckoutPrompt) => {
    pendingPromptRef.current = null;
    setToastMessage(null);
    setCheckoutPrompt(prompt);
  }, []);

  const revealPendingPrompt = useCallback(() => {
    const pending = pendingPromptRef.current;
    if (!pending) return;
    showPrompt(pending);
  }, [showPrompt]);

  const queuePrompt = useCallback(
    (prompt: CheckoutPrompt, deferPrompt?: boolean) => {
      bounceCart();
      if (deferPrompt) {
        pendingPromptRef.current = prompt;
        return;
      }
      showPrompt(prompt);
    },
    [bounceCart, showPrompt],
  );

  const completeFlyToCart = useCallback(() => {
    setFlyAnimation(null);
    revealPendingPrompt();
    flyResolveRef.current?.();
    flyResolveRef.current = null;
  }, [revealPendingPrompt]);

  const startFlyToCart = useCallback(
    (payload: FlyToCartAnimationState) => {
      if (prefersReducedMotion() || !getVisibleCartRect()) {
        completeFlyToCart();
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        flyResolveRef.current = resolve;
        setFlyAnimation(payload);
      });
    },
    [completeFlyToCart],
  );

  const value = useMemo<ShopCartContextValue>(
    () => ({
      items,
      itemCount: getCartCount(items),
      subtotal: getCartSubtotal(items),
      toastMessage,
      cartBounce,
      checkoutPrompt,
      flyAnimation,
      addReadyCase: (productId, title) => {
        const product = getReadyCaseById(productId);
        setItems((prev) => addReadyToCart(prev, productId));
        queuePrompt({
          title: title ?? product?.title ?? "قاب",
          previewUrl: product?.image,
        });
      },
      addCustomCase: (item, options) => {
        setItems((prev) => addCustomToCart(prev, item));
        queuePrompt(
          { title: item.title, previewUrl: item.previewUrl },
          options?.deferPrompt,
        );
      },
      incrementQty: (key) => {
        setItems((prev) => {
          const current = prev.find((item) => getCartItemKey(item) === key);
          return setCartItemQty(prev, key, (current?.qty ?? 0) + 1);
        });
      },
      decrementQty: (key) => {
        setItems((prev) => {
          const current = prev.find((item) => getCartItemKey(item) === key);
          return setCartItemQty(prev, key, (current?.qty ?? 0) - 1);
        });
      },
      removeItem: (key) => {
        setItems((prev) => removeCartItem(prev, key));
      },
      clearCart: () => setItems([]),
      dismissAddToCartToast,
      dismissCheckoutPrompt,
      startFlyToCart,
      completeFlyToCart,
    }),
    [
      items,
      toastMessage,
      cartBounce,
      checkoutPrompt,
      flyAnimation,
      dismissAddToCartToast,
      dismissCheckoutPrompt,
      queuePrompt,
      startFlyToCart,
      completeFlyToCart,
    ],
  );

  return (
    <ShopCartContext.Provider value={value}>
      {children}
      <AddToCartFeedback />
      <FlyToCartAnimator />
      <AnimatePresence>
        {checkoutPrompt ? (
          <CheckoutPromptModal
            key="checkout-prompt"
            prompt={checkoutPrompt}
            onClose={dismissCheckoutPrompt}
          />
        ) : null}
      </AnimatePresence>
    </ShopCartContext.Provider>
  );
}

export function useShopCart() {
  const context = useContext(ShopCartContext);
  if (!context) {
    throw new Error("useShopCart must be used within ShopCartProvider");
  }
  return context;
}

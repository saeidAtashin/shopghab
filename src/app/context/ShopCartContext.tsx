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

import AddToCartFeedback from "@/app/components/shop/AddToCartFeedback";
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
import { getCartItemKey } from "@/lib/shop/types";

type ShopCartContextValue = {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  toastMessage: string | null;
  cartBounce: boolean;
  addReadyCase: (productId: string, title?: string) => void;
  addCustomCase: (item: Omit<CustomCartLineItem, "kind" | "qty">) => void;
  incrementQty: (key: string) => void;
  decrementQty: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  dismissAddToCartToast: () => void;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartBounce, setCartBounce] = useState(false);
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setCartBounce(true);
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    bounceTimerRef.current = setTimeout(() => {
      setCartBounce(false);
      bounceTimerRef.current = null;
    }, 450);
  }, []);

  const value = useMemo<ShopCartContextValue>(
    () => ({
      items,
      itemCount: getCartCount(items),
      subtotal: getCartSubtotal(items),
      toastMessage,
      cartBounce,
      addReadyCase: (productId, title) => {
        setItems((prev) => addReadyToCart(prev, productId));
        showToast(`${title ?? "قاب"} به سبد خرید اضافه شد`);
      },
      addCustomCase: (item) => {
        setItems((prev) => addCustomToCart(prev, item));
        showToast(`${item.title} به سبد خرید اضافه شد`);
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
    }),
    [items, toastMessage, cartBounce, dismissAddToCartToast, showToast],
  );

  return (
    <ShopCartContext.Provider value={value}>
      {children}
      <AddToCartFeedback />
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

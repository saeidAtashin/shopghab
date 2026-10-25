"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, ShoppingCart } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import CartNavLink from "@/app/components/shop/CartNavLink";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

import {
  ICON_SIZE,
  iconButtonClass,
  loginButtonClass,
  logoutButtonClass,
  panelButtonClass,
} from "./nav-styles";

type NavActionsProps = {
  layout: "bar" | "drawer";
  onNavigate?: () => void;
};

export default function NavActions({ layout, onNavigate }: NavActionsProps) {
  const { user, logout } = useAuth();
  const { itemCount, cartBounce } = useShopCart();
  const panelHref = user?.role === "admin" ? "/admin" : "/dashboard";

  if (layout === "drawer") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-row-reverse items-center justify-between gap-3">
          <span className="text-sm font-semibold text-muted">تم</span>
          <ThemeToggle menuPlacement="top" menuAlign="end" />
        </div>
        <Link
          href="/cart"
          data-shop-cart-target
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-foreground transition-all hover:border-[#5145FF]/60 touch-manipulation"
        >
          <ShoppingCart size={ICON_SIZE} className="text-[#C4C0FF]" aria-hidden />
          سبد خرید
          {itemCount > 0 ? (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#5145FF] px-1 text-xs text-white">
              {itemCount}
            </span>
          ) : null}
        </Link>
        {!user ? (
          <Link
            href="/login"
            onClick={onNavigate}
            className="w-full rounded-xl bg-[#5145FF] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#5145FF]/25 touch-manipulation"
          >
            ورود / ثبت‌نام
          </Link>
        ) : (
          <>
            <Link
              href={panelHref}
              onClick={onNavigate}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-foreground transition-all hover:border-[#5145FF]/60 touch-manipulation"
            >
              <LayoutDashboard size={ICON_SIZE} className="text-[#C4C0FF]" aria-hidden />
              پنل کاربری
            </Link>
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                logout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20 touch-manipulation"
            >
              <LogOut size={ICON_SIZE} aria-hidden />
              خروج
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 lg:flex">
        <ThemeToggle />
        {!user ? (
          <Link href="/login" className={loginButtonClass}>
            ورود
          </Link>
        ) : (
          <>
            <Link href={panelHref} className={panelButtonClass}>
              <LayoutDashboard size={ICON_SIZE} className="shrink-0 text-[#C4C0FF]" aria-hidden />
              پنل کاربری
            </Link>
            <button type="button" onClick={logout} className={logoutButtonClass} aria-label="خروج">
              <LogOut size={ICON_SIZE} aria-hidden />
            </button>
          </>
        )}
      </div>
      <CartNavLink
        itemCount={itemCount}
        receiving={cartBounce}
        className={iconButtonClass}
      />
    </div>
  );
}

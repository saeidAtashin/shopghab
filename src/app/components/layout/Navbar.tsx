"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import CartNavLink from "../shop/CartNavLink";
import { navbarNavItems } from "@/lib/site-nav";
import MenuLogoMark, { type MenuLogoMarkHandle } from "../ui/MenuLogoMark";
import SiteLogo from "../ui/SiteLogo";
import ThemeToggle from "../ui/ThemeToggle";
import {
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";

const STROKE_SCROLL_RANGE = 480;

function navLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount, cartBounce } = useShopCart();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const [mobileBrandOpen, setMobileBrandOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const logoRef = useRef<MenuLogoMarkHandle>(null);
  const scrollRafPendingRef = useRef(false);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const updateStrokeFromScroll = () => {
      logoRef.current?.setProgress(scrollProgressRef.current);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      scrollProgressRef.current = Math.min(
        1,
        Math.max(0, window.scrollY / STROKE_SCROLL_RANGE),
      );

      if (scrollRafPendingRef.current) return;
      scrollRafPendingRef.current = true;
      requestAnimationFrame(() => {
        scrollRafPendingRef.current = false;
        updateStrokeFromScroll();
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setMobileOpen(null);
    logoRef.current?.setProgress(scrollProgressRef.current);
  }, []);

  const toggleMenu = useCallback(() => {
    if (open) closeMenu();
    else openMenu();
  }, [open, closeMenu, openMenu]);

  const cartClassName =
    "rounded-lg border border-border bg-card p-2.5 text-foreground transition hover:border-cyan-500/50 touch-manipulation";

  const loginClassName =
    "relative overflow-hidden rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 sm:px-5 lg:px-6 touch-manipulation";

  const panelClassName =
    "flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-all hover:border-cyan-500/50 sm:gap-2 sm:px-5 sm:text-sm touch-manipulation";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-100 border-b transition-all duration-500 ${scrolled
          ? "h-16 border-border bg-background/80 backdrop-blur-2xl"
          : "h-16 border-transparent bg-transparent md:h-20"
          }`}
      >
        <div
          className="mx-auto h-full max-w-7xl flex justify-between items-center sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4 px-4 sm:px-6"
        >
          {/* Actions — end (left in RTL) */}
          <div className="flex min-w-0 items-center justify-start gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 lg:flex xl:gap-3">
              <ThemeToggle />

              {!user ? (
                <Link href="/login" className={loginClassName}>
                  ورود
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className={panelClassName}
                  >
                    <LayoutDashboard
                      size={16}
                      className="shrink-0 text-cyan-400 sm:hidden"
                    />
                    <LayoutDashboard
                      size={18}
                      className="hidden shrink-0 text-cyan-400 sm:block"
                    />
                    <span className="hidden sm:inline">پنل کاربری</span>
                    <span className="sm:hidden">پنل</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20 touch-manipulation"
                    aria-label="خروج"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}

              <CartNavLink
                itemCount={itemCount}
                receiving={cartBounce}
                className={cartClassName}
              />
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                data-route-loader-ignore="true"
                className="relative h-10 w-10 shrink-0 touch-manipulation sm:h-11 sm:w-11"
                aria-label={open ? "بستن منو" : "باز کردن منو"}
                aria-expanded={open}
              >
                <MenuLogoMark className="h-10 w-10 sm:h-11 sm:w-11" ref={logoRef} />
              </button>
              <CartNavLink
                itemCount={itemCount}
                receiving={cartBounce}
                className={cartClassName}
              />
            </div>
          </div>
          {/* Desktop nav — center */}
          <nav
            className="hidden items-center justify-center gap-0.5 lg:flex xl:gap-1"
            aria-label="منوی اصلی"
          >
            {navbarNavItems.map((item) => {
              const active = navLinkActive(pathname, item.href);

              return item.children ? (
                <div
                  key={item.title}
                  className="group relative px-2 py-2 xl:px-3"
                >
                  <div className="flex items-center gap-0.5">
                    <Link
                      href={item.href}
                      className={`text-sm font-medium transition-colors ${active
                        ? "text-cyan-400"
                        : "text-muted hover:text-cyan-400"
                        }`}
                    >
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      aria-label={`${item.title} — زیرمنو`}
                      className="flex items-center p-0.5 text-muted transition-colors hover:text-cyan-400"
                    >
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-300 group-hover:rotate-180"
                      />
                    </button>
                  </div>

                  <div className="invisible absolute top-full right-0 w-56 translate-y-2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-2xl border border-border bg-card/90 p-2 shadow-2xl backdrop-blur-2xl">
                      {item.children.map((sub) =>
                        sub.children ? (
                          <div
                            key={sub.href}
                            className="group/brand relative"
                          >
                            <Link
                              href={sub.href}
                              className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm text-muted transition-all hover:bg-surface hover:text-foreground"
                            >
                              <span>{sub.title}</span>
                              <ChevronDown
                                size={12}
                                className="-rotate-90 opacity-50 transition-transform group-hover/brand:opacity-100"
                              />
                            </Link>
                            <div className="invisible absolute top-0 right-full mr-1 w-48 translate-x-2 opacity-0 transition-all duration-200 group-hover/brand:visible group-hover/brand:translate-x-0 group-hover/brand:opacity-100">
                              <div className="rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-2xl">
                                {sub.children.map((series) => (
                                  <Link
                                    key={series.href}
                                    href={series.href}
                                    className="block rounded-xl px-3 py-2 text-sm text-muted transition-all hover:bg-surface hover:text-foreground"
                                  >
                                    {series.title}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block rounded-xl px-4 py-2.5 text-sm text-muted transition-all hover:bg-surface hover:text-foreground"
                          >
                            {sub.title}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors xl:px-4 ${active
                    ? "text-cyan-400"
                    : "text-muted hover:text-cyan-400"
                    }`}
                >
                  {item.title}
                  <span
                    className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 bg-cyan-500 transition-all ${active ? "w-1/2" : "w-0 group-hover:w-1/2"
                      }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Logo — start (right in RTL) */}
          <div className="hidden min-w-0 items-center justify-end lg:flex">
            <SiteLogo
              className={scrolled ? "scale-95 transition-transform" : ""}
            />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={closeMenu}
          aria-hidden
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="منوی موبایل"
          className={`absolute right-0 top-0 flex h-full w-[min(100vw-3rem,20rem)] flex-col overflow-hidden border-l border-border bg-background transition-transform duration-500 sm:w-80 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-5 sm:px-8 sm:py-6">
              <SiteLogo
                showText={false}
                imageClassName="h-10 w-10 rounded-lg"
                className="gap-0"
              />
              <button
                type="button"
                onClick={closeMenu}
                data-route-loader-ignore="true"
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground touch-manipulation"
                aria-label="بستن منو"
              >
                <X size={28} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">

              <nav
                className="flex flex-col gap-1 text-right"
                aria-label="منوی موبایل"
              >
                {navbarNavItems.map((item) => {
                  const active = navLinkActive(pathname, item.href);

                  return (
                    <div key={item.title}>
                      {item.children ? (
                        <>
                          <div className="flex w-full items-center justify-between rounded-xl px-2 py-2">
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className={`text-lg font-bold transition-colors sm:text-xl ${active
                                ? "text-cyan-400"
                                : "text-foreground hover:text-cyan-400"
                                }`}
                            >
                              {item.title}
                            </Link>
                            <button
                              type="button"
                              dir="ltr"
                              data-route-loader-ignore="true"
                              aria-expanded={mobileOpen === item.title}
                              aria-label={`${item.title} — زیرمنو`}
                              className="rounded-lg p-2 text-cyan-500 transition-colors hover:bg-surface touch-manipulation"
                              onClick={() =>
                                setMobileOpen(
                                  mobileOpen === item.title ? null : item.title,
                                )
                              }
                            >
                              <ChevronDown
                                size={18}
                                className={`transition-transform ${mobileOpen === item.title ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${mobileOpen === item.title ? "max-h-[min(70vh,32rem)] opacity-100" : "max-h-0 opacity-0"}`}
                          >
                            <div className="mr-2 flex flex-col gap-2 border-r border-cyan-500/20 py-1 pr-4">
                              {item.children.map((sub) =>
                                sub.children ? (
                                  <div key={sub.href}>
                                    <div className="flex w-full items-center justify-between rounded-lg px-1 py-1">
                                      <Link
                                        href={sub.href}
                                        onClick={closeMenu}
                                        className={`text-sm transition-colors sm:text-base ${pathname === sub.href || pathname.startsWith(`${sub.href}/`)
                                          ? "text-cyan-400"
                                          : "text-muted hover:text-cyan-400"
                                          }`}
                                      >
                                        {sub.title}
                                      </Link>
                                      <button
                                        type="button"
                                        data-route-loader-ignore="true"
                                        aria-expanded={mobileBrandOpen === sub.href}
                                        aria-label={`${sub.title} — سری‌ها`}
                                        className="rounded-lg p-1.5 text-cyan-500 transition-colors hover:bg-surface touch-manipulation"
                                        onClick={() =>
                                          setMobileBrandOpen(
                                            mobileBrandOpen === sub.href ? null : sub.href,
                                          )
                                        }
                                      >
                                        <ChevronDown
                                          size={14}
                                          className={`transition-transform ${mobileBrandOpen === sub.href ? "rotate-180" : ""}`}
                                        />
                                      </button>
                                    </div>
                                    <div
                                      className={`overflow-hidden transition-all duration-300 ${mobileBrandOpen === sub.href ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                    >
                                      <div className="mr-3 flex flex-col gap-2 border-r border-border py-1 pr-3">
                                        {sub.children.map((series) => (
                                          <Link
                                            key={series.href}
                                            href={series.href}
                                            onClick={closeMenu}
                                            className={`text-xs transition-colors sm:text-sm ${pathname === series.href.split("?")[0]
                                              ? "text-cyan-400"
                                              : "text-muted hover:text-cyan-400"
                                              }`}
                                          >
                                            {series.title}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    onClick={closeMenu}
                                    className={`text-sm transition-colors sm:text-base ${pathname === sub.href
                                      ? "text-cyan-400"
                                      : "text-muted hover:text-cyan-400"
                                      }`}
                                  >
                                    {sub.title}
                                  </Link>
                                ),
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className={`block rounded-xl px-2 py-3 text-lg font-bold transition-colors sm:text-xl ${active
                            ? "text-cyan-400"
                            : "text-foreground hover:text-cyan-400"
                            }`}
                        >
                          {item.title}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="shrink-0 border-t border-border px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-muted">تم</span>
                  <ThemeToggle menuPlacement="top" menuAlign="end" />
                </div>
                <Link
                  href="/cart"
                  data-shop-cart-target
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-center text-sm font-bold text-foreground transition-all hover:border-cyan-500/50 sm:py-4 sm:text-base touch-manipulation"
                >
                  <ShoppingCart size={20} className="text-cyan-400" />
                  سبد خرید
                  {itemCount > 0 ? (
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-500 px-1 text-xs text-black">
                      {itemCount}
                    </span>
                  ) : null}
                </Link>
                {!user ? (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full rounded-xl bg-cyan-500 py-3.5 text-center text-sm font-bold text-black shadow-lg shadow-cyan-500/20 sm:py-4 sm:text-base touch-manipulation"
                  >
                    ورود / ثبت‌نام
                  </Link>
                ) : (
                  <>
                    <Link
                      href={user.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={closeMenu}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-center text-sm font-bold text-foreground transition-all hover:border-cyan-500/50 sm:py-4 sm:text-base touch-manipulation"
                    >
                      <LayoutDashboard size={20} className="text-cyan-400" />
                      پنل کاربری
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20 sm:py-4 sm:text-base touch-manipulation"
                    >
                      <LogOut size={20} />
                      خروج
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

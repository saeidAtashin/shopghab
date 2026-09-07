"use client";

import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { navbarNavItems } from "@/lib/site-nav";
import SiteLogo from "../ui/SiteLogo";
import { X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

const CD_SCROLL_FACTOR = 0.35;
const CD_BURST_MS = 520;
const CD_BURST_EXTRA_DEG = 900;
const OPEN_MENU_DELAY_MS = 200;

function getRotationDeg(el: HTMLElement) {
  const { transform } = window.getComputedStyle(el);
  if (!transform || transform === "none") return 0;
  const { a, b } = new DOMMatrix(transform);
  return (Math.atan2(b, a) * 180) / Math.PI;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const cdRef = useRef<HTMLDivElement>(null);
  const burstRafRef = useRef<number | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafPendingRef = useRef(false);
  const isBurstingRef = useRef(false);
  const scrollRotationRef = useRef(0);

  useEffect(() => {
    const updateCdFromScroll = () => {
      const el = cdRef.current;
      if (!el || isBurstingRef.current) return;
      el.style.transform = `rotate(${scrollRotationRef.current}deg)`;
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      scrollRotationRef.current = window.scrollY * CD_SCROLL_FACTOR;

      if (scrollRafPendingRef.current) return;
      scrollRafPendingRef.current = true;
      requestAnimationFrame(() => {
        scrollRafPendingRef.current = false;
        updateCdFromScroll();
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (burstRafRef.current) cancelAnimationFrame(burstRafRef.current);
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    };
  }, []);

  const burstCdOnOpen = useCallback(() => {
    const el = cdRef.current;
    if (!el) return;

    if (burstRafRef.current) cancelAnimationFrame(burstRafRef.current);
    isBurstingRef.current = true;

    const startTime = performance.now();
    const startAngle = getRotationDeg(el);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / CD_BURST_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      const burstAngle = startAngle + CD_BURST_EXTRA_DEG * eased;
      el.style.transform = `rotate(${burstAngle}deg)`;

      if (progress < 1) {
        burstRafRef.current = requestAnimationFrame(tick);
        return;
      }

      isBurstingRef.current = false;
      el.style.transform = `rotate(${scrollRotationRef.current}deg)`;
      burstRafRef.current = null;
    };

    burstRafRef.current = requestAnimationFrame(tick);
  }, []);

  const openMenu = useCallback(() => {
    burstCdOnOpen();
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = setTimeout(() => {
      setOpen(true);
      openTimerRef.current = null;
    }, OPEN_MENU_DELAY_MS);
  }, [burstCdOnOpen]);

  const closeMenu = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    setOpen(false);
    const el = cdRef.current;
    if (el && !isBurstingRef.current) {
      el.style.transform = `rotate(${scrollRotationRef.current}deg)`;
    }
  }, []);

  const toggleMenu = useCallback(() => {
    if (open) closeMenu();
    else openMenu();
  }, [open, closeMenu, openMenu]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
          scrolled
            ? "border-white/10 bg-black/80 backdrop-blur-2xl h-16"
            : "border-transparent bg-transparent h-24"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Actions / Auth (Left Side) */}
          <div className="flex items-center gap-4 flex-1">
            <button
              type="button"
              onClick={toggleMenu}
              data-route-loader-ignore="true"
              className="md:hidden relative h-11 w-11 shrink-0 touch-manipulation"
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              aria-expanded={open}
            >
              <div ref={cdRef} className="h-11 w-11 will-change-transform">
                <Image
                  src="/obj-console/cd.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.35)] filter hue-rotate-331 saturate-200"
                  priority
                />
              </div>
            </button>

            <div className="flex md:hidden items-center gap-2">
              {!user ? (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  ورود
                </Link>
              ) : (
                <>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    aria-label="خروج"
                  >
                    <LogOut size={18} />
                  </button>
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold text-xs hover:border-cyan-500/50 transition-all"
                  >
                    <LayoutDashboard size={16} className="text-cyan-400 shrink-0" />
                    پنل
                  </Link>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="relative group overflow-hidden px-6 py-2 rounded-lg bg-cyan-500 text-black font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
                  >
                    ورود
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold text-sm hover:border-cyan-500/50 transition-all"
                  >
                    <LayoutDashboard size={18} className="text-cyan-400" />
                    پنل کاربری
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav (Center) */}
          <nav className="hidden md:flex items-center gap-1 flex-[2] justify-center">
            {navbarNavItems.map((item) =>
              item.children ? (
                <div key={item.title} className="relative group px-3 py-2">
                  <button className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors">
                    {item.title}
                    <ChevronDown
                      size={14}
                      className="group-hover:rotate-180 transition-transform duration-300"
                    />
                  </button>

                  <div className="absolute top-full right-0 w-56 pt-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-2 backdrop-blur-2xl shadow-2xl">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors relative group"
                >
                  {item.title}
                  <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-cyan-500 -translate-x-1/2 transition-all group-hover:w-1/2" />
                </Link>
              ),
            )}
          </nav>

          {/* Logo (Right Side) */}
          <div className="flex-1 flex justify-end">
            <SiteLogo />
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - با استایل Cyberpunk */}
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={closeMenu}
        />

        <div
          className={`absolute right-0 top-0 h-full overflow-y-auto w-80 bg-zinc-950 border-l border-white/10 p-8 transition-transform duration-500 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Background Grid inside Mobile Menu */}
          <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-12">
              <SiteLogo
                showText={false}
                imageClassName="h-10 w-10 rounded-lg"
                className="gap-0"
              />
              <button
                onClick={closeMenu}
                data-route-loader-ignore="true"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col gap-6 text-right">
              {navbarNavItems.map((item) => (
                <div key={item.title}>
                  {item.children ? (
                    <>
                      <button
                        dir="ltr"
                        data-route-loader-ignore="true"
                        className="flex justify-between items-center w-full text-xl font-bold text-white"
                        onClick={() =>
                          setMobileOpen(
                            mobileOpen === item.title ? null : item.title,
                          )
                        }
                      >
                        <ChevronDown
                          size={18}
                          className={`text-cyan-500 transition-transform ${mobileOpen === item.title ? "rotate-180" : ""}`}
                        />
                        {item.title}
                      </button>
                      <div
                        className={`mt-4 overflow-hidden transition-all duration-300 ${mobileOpen === item.title ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                      >
                        <div className="flex flex-col gap-4 pr-4 border-r border-cyan-500/20 mr-2">
                          {item.children.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={closeMenu}
                              className="text-zinc-400 hover:text-cyan-400 transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="text-xl font-bold text-white hover:text-cyan-400 transition-colors"
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Auth Actions */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4">
              {!user ? (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full py-4 rounded-xl bg-cyan-500 text-center text-black font-bold shadow-lg shadow-cyan-500/20"
                >
                  ورود
                </Link>
              ) : (
                <>
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={closeMenu}
                    className="w-full py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-white font-bold hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
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
                    className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
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
    </>
  );
}

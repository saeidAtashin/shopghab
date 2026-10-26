"use client";

import { Home, LayoutGrid, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/app/context/AuthContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import { cn } from "@/lib/utils";

export default function HomeMobileDock() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { itemCount } = useShopCart();
  const profileHref = user ? "/dashboard" : "/login";

  const tabs = [
    { href: "/", label: "خانه", icon: Home, active: pathname === "/" },
    { href: "/designs", label: "دسته‌بندی‌ها", icon: LayoutGrid, active: pathname.startsWith("/designs") },
    { href: "/cart", label: "سبد خرید", icon: ShoppingCart, active: pathname === "/cart", count: itemCount },
    { href: profileHref, label: "پروفایل", icon: UserRound, active: pathname === profileHref },
  ] as const;

  return (
    <nav
      aria-label="ناوبری پایین"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080D18]/95 backdrop-blur-md xl:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = "count" in tab ? tab.count : 0;
          return (
            <li key={tab.label}>
              <Link
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "flex h-full min-w-0 flex-col items-center justify-center gap-1 px-1 text-[11px] font-bold",
                  tab.active ? "text-[#C4C0FF]" : "text-[#9AA3B8]",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden />
                  {count > 0 ? (
                    <span className="absolute -end-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5145FF] px-1 text-[9px] font-bold text-white">
                      {count.toLocaleString("fa-IR")}
                    </span>
                  ) : null}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

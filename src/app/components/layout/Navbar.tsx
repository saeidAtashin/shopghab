"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import SiteLogo from "@/app/components/ui/SiteLogo";
import { lockPageScroll } from "@/lib/scroll-lock";

import DesktopNav from "./nav/DesktopNav";
import MobileDrawer from "./nav/MobileDrawer";
import NavActions from "./nav/NavActions";
import NavSearch from "./nav/NavSearch";
import { ICON_SIZE, iconButtonClass } from "./nav/nav-styles";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    return lockPageScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <header className="site-chrome fixed inset-x-0 top-0 z-50 h-[4.5rem] border-b border-white/10 bg-[#080D18]/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <SiteLogo onMedia />
          <DesktopNav />
          <NavSearch className="ms-auto hidden w-52 shrink-0 lg:block xl:w-64" />
          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <NavActions layout="bar" />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              data-route-loader-ignore="true"
              className={`${iconButtonClass} lg:hidden`}
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              aria-expanded={open}
            >
              {open ? <X size={ICON_SIZE} aria-hidden /> : <Menu size={ICON_SIZE} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

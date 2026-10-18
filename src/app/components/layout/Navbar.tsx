"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import SiteLogo from "@/app/components/ui/SiteLogo";

import DesktopNav from "./nav/DesktopNav";
import MobileDrawer from "./nav/MobileDrawer";
import NavActions from "./nav/NavActions";
import { ICON_SIZE, iconButtonClass } from "./nav/nav-styles";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
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
      <header className="fixed inset-x-0 top-0 z-50 h-[4.5rem] border-b border-border bg-black/30">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 pt-2 sm:px-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <SiteLogo onMedia />
          <DesktopNav />
          <div className="flex items-center gap-2">
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

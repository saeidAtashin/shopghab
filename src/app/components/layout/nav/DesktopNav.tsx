"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { desktopNavItems, type SiteNavBranch, type SiteNavItem } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

import { isNavActive } from "./is-nav-active";
import { navItemIcon } from "./nav-icons";
import { ICON_SIZE, navBarLabelClass } from "./nav-styles";

function LeafLink({
  href,
  title,
  active,
  className,
}: {
  href: string;
  title: string;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors xl:px-4",
        navBarLabelClass,
        active ? "text-[#C4C0FF]" : "text-white hover:text-[#C4C0FF]",
        className,
      )}
    >
      {title}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-[#5145FF] transition-all",
          active ? "w-1/2" : "w-0 group-hover:w-1/2",
        )}
      />
    </Link>
  );
}

const menuItemClass =
  "block rounded-xl px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface hover:text-[#C4C0FF]";

function BrandFlyout({ sub }: { sub: SiteNavBranch }) {
  return (
    <div className="group/brand relative">
      <Link
        href={sub.href}
        className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface hover:text-[#C4C0FF]"
      >
        <span>{sub.title}</span>
        <ChevronDown
          size={ICON_SIZE}
          aria-hidden
          className="rotate-90 opacity-70 transition-opacity group-hover/brand:opacity-100 group-focus-within/brand:opacity-100"
        />
      </Link>
      <div
        className={cn(
          "invisible absolute top-0 z-20 w-52 ps-2 opacity-0 transition-all duration-200",
          "start-[calc(100%-0.5rem)]",
          "group-hover/brand:visible group-hover/brand:start-full group-hover/brand:opacity-100",
          "group-focus-within/brand:visible group-focus-within/brand:start-full group-focus-within/brand:opacity-100",
        )}
      >
        <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/50">
          {sub.children?.map((series) => (
            <Link key={series.href} href={series.href} className={menuItemClass}>
              {series.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopMenuItem({ item }: { item: SiteNavItem }) {
  const pathname = usePathname();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const open = pinned || hovered;
  const active =
    item.title === "دسته‌بندی‌ها"
      ? pathname.startsWith("/designs/category")
      : item.title === "طرح‌ها"
        ? pathname === "/designs" ||
          (pathname.startsWith("/designs/") && !pathname.startsWith("/designs/category"))
        : isNavActive(pathname, item.href);
  const Icon = navItemIcon(item.href);

  useEffect(() => {
    setPinned(false);
    setHovered(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPinned(false);
        setHovered(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(false);
        setHovered(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!item.children) {
    return (
      <LeafLink href={item.href} title={item.title} active={active} />
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative px-2 py-2 xl:px-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-0.5">
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
            navBarLabelClass,
            active ? "text-[#C4C0FF]" : "text-white hover:text-[#C4C0FF]",
          )}
        >
          {Icon ? <Icon size={ICON_SIZE} aria-hidden /> : null}
          {item.title}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`${item.title} — زیرمنو`}
          className={cn(
            "flex items-center rounded-md p-0.5 text-white transition-colors hover:text-[#C4C0FF]",
            navBarLabelClass,
          )}
          onClick={() => setPinned((value) => !value)}
        >
          <ChevronDown
            size={ICON_SIZE}
            aria-hidden
            className={cn("transition-transform duration-300", open && "rotate-180")}
          />
        </button>
      </div>

      <div
        id={menuId}
        className={cn(
          "absolute top-full start-0 z-10 w-56 pt-2 transition-all duration-300",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-2 opacity-0",
        )}
      >
        <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/50">
          {item.children.map((sub) =>
            sub.children ? (
              <BrandFlyout key={sub.href} sub={sub} />
            ) : (
              <Link key={sub.href} href={sub.href} className={menuItemClass}>
                {sub.title}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default function DesktopNav() {
  return (
    <nav
      className="hidden items-center justify-center gap-0.5 lg:flex xl:gap-1"
      aria-label="منوی اصلی"
    >
      {desktopNavItems.map((item) => (
        <DesktopMenuItem key={`${item.title}-${item.href}`} item={item} />
      ))}
    </nav>
  );
}

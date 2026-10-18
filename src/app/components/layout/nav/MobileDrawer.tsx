"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

import SiteLogo from "@/app/components/ui/SiteLogo";
import { navbarNavItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

import { isNavActive } from "./is-nav-active";
import NavActions from "./NavActions";
import { navItemIcon } from "./nav-icons";
import { ICON_SIZE, iconButtonClass } from "./nav-styles";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const [sectionOpen, setSectionOpen] = useState<string | null>(null);
  const [brandOpen, setBrandOpen] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] transition-all duration-500",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
      aria-hidden={!open}
      inert={open ? undefined : true}
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="منوی موبایل"
        className={cn(
          "absolute end-0 top-0 flex h-full w-[min(100vw-3rem,20rem)] flex-col overflow-hidden border-s border-border bg-background transition-transform duration-500 sm:w-80",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-row-reverse items-center justify-between border-b border-border px-5 py-5 sm:px-8">
            <SiteLogo onClick={onClose} className="flex-row-reverse" />
            <button
              type="button"
              onClick={onClose}
              data-route-loader-ignore="true"
              className={iconButtonClass}
              aria-label="بستن منو"
            >
              <X size={ICON_SIZE} aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            <nav className="flex flex-col gap-1 text-end" aria-label="منوی موبایل">
              {navbarNavItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                const Icon = navItemIcon(item.href);

                return (
                  <div key={item.href}>
                    {item.children ? (
                      <>
                        <div className="flex w-full flex-row-reverse items-center justify-between rounded-xl px-2 py-2">
                          <Link
                            href={item.href}
                            onClick={onClose}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "inline-flex flex-row-reverse items-center gap-2 text-lg font-bold transition-colors",
                              active
                                ? "text-cyan-400"
                                : "text-foreground hover:text-cyan-400",
                            )}
                          >
                            {Icon ? <Icon size={ICON_SIZE} aria-hidden /> : null}
                            {item.title}
                          </Link>
                          <button
                            type="button"
                            data-route-loader-ignore="true"
                            aria-expanded={sectionOpen === item.href}
                            aria-label={`${item.title} — زیرمنو`}
                            className="rounded-lg p-2 text-cyan-500 transition-colors hover:bg-surface touch-manipulation"
                            onClick={() =>
                              setSectionOpen((current) =>
                                current === item.href ? null : item.href,
                              )
                            }
                          >
                            <ChevronDown
                              size={ICON_SIZE}
                              aria-hidden
                              className={cn(
                                "transition-transform",
                                sectionOpen === item.href && "rotate-180",
                              )}
                            />
                          </button>
                        </div>
                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-300",
                            sectionOpen === item.href
                              ? "max-h-[min(70vh,32rem)] opacity-100"
                              : "max-h-0 opacity-0",
                          )}
                          inert={sectionOpen === item.href ? undefined : true}
                          aria-hidden={sectionOpen !== item.href}
                        >
                          <div className="me-2 flex flex-col gap-2 border-e border-cyan-500/20 py-1 pe-4">
                            {item.children.map((sub) =>
                              sub.children ? (
                                <div key={sub.href}>
                                  <div className="flex w-full flex-row-reverse items-center justify-between rounded-lg px-1 py-1">
                                    <Link
                                      href={sub.href}
                                      onClick={onClose}
                                      className={cn(
                                        "text-sm transition-colors sm:text-base",
                                        isNavActive(pathname, sub.href)
                                          ? "text-cyan-400"
                                          : "text-muted hover:text-cyan-400",
                                      )}
                                    >
                                      {sub.title}
                                    </Link>
                                    <button
                                      type="button"
                                      data-route-loader-ignore="true"
                                      aria-expanded={brandOpen === sub.href}
                                      aria-label={`${sub.title} — سری‌ها`}
                                      className="rounded-lg p-1.5 text-cyan-500 transition-colors hover:bg-surface touch-manipulation"
                                      onClick={() =>
                                        setBrandOpen((current) =>
                                          current === sub.href ? null : sub.href,
                                        )
                                      }
                                    >
                                      <ChevronDown
                                        size={ICON_SIZE}
                                        aria-hidden
                                        className={cn(
                                          "transition-transform",
                                          brandOpen === sub.href && "rotate-180",
                                        )}
                                      />
                                    </button>
                                  </div>
                                  <div
                                    className={cn(
                                      "overflow-hidden transition-all duration-300",
                                      brandOpen === sub.href
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0",
                                    )}
                                    inert={brandOpen === sub.href ? undefined : true}
                                    aria-hidden={brandOpen !== sub.href}
                                  >
                                    <div className="me-3 flex flex-col gap-2 border-e border-border py-1 pe-3">
                                      {sub.children.map((series) => (
                                        <Link
                                          key={series.href}
                                          href={series.href}
                                          onClick={onClose}
                                          className={cn(
                                            "text-xs transition-colors sm:text-sm",
                                            isNavActive(pathname, series.href)
                                              ? "text-cyan-400"
                                              : "text-muted hover:text-cyan-400",
                                          )}
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
                                  onClick={onClose}
                                  className={cn(
                                    "text-sm transition-colors sm:text-base",
                                    isNavActive(pathname, sub.href)
                                      ? "text-cyan-400"
                                      : "text-muted hover:text-cyan-400",
                                  )}
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
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex flex-row-reverse items-center gap-2 rounded-xl px-2 py-3 text-lg font-bold transition-colors",
                          active
                            ? "text-cyan-400"
                            : "text-foreground hover:text-cyan-400",
                        )}
                      >
                        {Icon ? <Icon size={ICON_SIZE} aria-hidden /> : null}
                        {item.title}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="shrink-0 border-t border-border px-5 py-5 sm:px-8">
            <NavActions layout="drawer" onNavigate={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

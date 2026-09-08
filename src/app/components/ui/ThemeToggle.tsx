"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type ThemeOption = {
  value: "system" | "light" | "dark";
  label: string;
  Icon: typeof Sun;
};

const OPTIONS: ThemeOption[] = [
  { value: "system", label: "سیستم", Icon: Monitor },
  { value: "light", label: "روشن", Icon: Sun },
  { value: "dark", label: "تاریک", Icon: Moon },
];

export default function ThemeToggle({
  className,
  menuPlacement = "bottom",
  menuAlign = "start",
}: {
  className?: string;
  /** Open above or below the trigger */
  menuPlacement?: "top" | "bottom";
  /** Align menu to inline-start or inline-end of trigger (keeps menu on-screen in RTL) */
  menuAlign?: "start" | "end";
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "rounded-lg border border-border bg-card p-2.5 text-muted transition touch-manipulation",
          className,
        )}
        aria-label="انتخاب تم"
        disabled
      >
        <Monitor size={18} aria-hidden />
      </button>
    );
  }

  const active = theme ?? "system";
  const DisplayIcon =
    active === "system"
      ? resolvedTheme === "dark"
        ? Moon
        : Sun
      : active === "dark"
        ? Moon
        : Sun;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg border border-border bg-card p-2.5 text-foreground transition hover:border-cyan-500/50 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
        aria-label="انتخاب تم"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <DisplayIcon size={18} aria-hidden />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="گزینه‌های تم"
          className={cn(
            "absolute z-50 min-w-[9rem] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg",
            menuPlacement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
            menuAlign === "start" ? "start-0" : "end-0",
          )}
        >
          {OPTIONS.map(({ value, label, Icon }) => {
            const isActive = active === value;
            return (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-surface",
                  isActive
                    ? "text-cyan-500 font-semibold"
                    : "text-foreground",
                )}
              >
                <Icon size={16} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

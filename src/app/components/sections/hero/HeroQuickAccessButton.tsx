"use client";

import { ChevronDown, MousePointer2, Sparkles } from "lucide-react";

type HeroQuickAccessButtonProps = {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
};

export default function HeroQuickAccessButton({
  onClick,
  isOpen = false,
  className = "",
}: HeroQuickAccessButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onClick}
      className={`group flex w-full min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-transparent px-3 py-2.5 text-xl sorenanormal text-blue-500 transition-[color,border-color,background-color,transform] active:scale-[0.98] hover:border-blue-400/20 hover:bg-blue-500/5 hover:text-blue-400 sm:min-h-0 sm:justify-start sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-2xl sm:hover:bg-transparent ${className}`}
    >
      <span
        aria-hidden
        className="animate-hero-quick-sparkle shrink-0 text-blue-400 transition-colors group-hover:text-cyan-300"
      >
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>

      <span className="relative inline-flex items-center px-2 py-1">
        <span className="animate-hero-quick-label relative z-[1] leading-none">
          دسترسی سریع
        </span>

        <span
          aria-hidden
          className="animate-hero-quick-ripple pointer-events-none absolute left-1/2 top-1/2 z-0 h-5 w-5 rounded-full border-2 border-cyan-400/60 bg-cyan-400/10"
        />

        <span
          aria-hidden
          className="animate-hero-quick-pointer pointer-events-none absolute z-10 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]"
          style={{ top: "-0.35rem", insetInlineEnd: "-0.15rem" }}
        >
          <MousePointer2
            className="h-5 w-5 sm:h-6 sm:w-6"
            strokeWidth={2.25}
            fill="currentColor"
            fillOpacity={0.15}
          />
        </span>
      </span>

      <ChevronDown
        aria-hidden
        className={`ms-auto h-4 w-4 shrink-0 text-blue-400/80 transition-transform duration-300 sm:hidden ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

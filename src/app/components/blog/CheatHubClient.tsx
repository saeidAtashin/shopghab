"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Filter, Search, X } from "lucide-react";

import ConsoleTabIcon from "@/app/components/ui/ConsoleTabIcon";
import type { BlogGameSection } from "@/app/data/blog";
import { filterCheatSections } from "@/lib/blog-cheats-filters";
import {
  cheatGamePath,
  CHEAT_POST_SLUG,
  type CheatConsoleFilter,
} from "@/lib/blog-cheats-paths";
import { cn } from "@/lib/utils";

import BlogCheatSectionDeferred from "./BlogCheatSectionDeferred";

const CONSOLE_TABS: {
  id: CheatConsoleFilter;
  label: string;
  icon?: string;
}[] = [
  { id: "all", label: "همه" },
  { id: "ps5", label: "PS5", icon: "/icons/ps5.svg" },
  { id: "ps4", label: "PS4", icon: "/icons/ps4.svg" },
  { id: "xbox", label: "Xbox", icon: "/icons/xbox.svg" },
];

type SectionLink = { id: string; title: string };

export type PopularCheatGameLink = {
  gameSlug: string;
  name: string;
};

type Props = {
  sections: BlogGameSection[];
  sectionLinks: SectionLink[];
  popularGames: PopularCheatGameLink[];
};

export default function CheatHubClient({
  sections,
  sectionLinks,
  popularGames,
}: Props) {
  const [consoleFilter, setConsoleFilter] = useState<CheatConsoleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevStuckRef = useRef<boolean | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prevStuckRef.current === false && isStuck) {
      setIsExpanded(false);
    }
    prevStuckRef.current = isStuck;
  }, [isStuck]);

  const filteredSections = useMemo(
    () => filterCheatSections(sections, consoleFilter, debouncedQuery),
    [sections, consoleFilter, debouncedQuery],
  );

  const totalGames = filteredSections.reduce(
    (sum, section) => sum + section.games.length,
    0,
  );

  const activeConsoleLabel =
    CONSOLE_TABS.find((tab) => tab.id === consoleFilter)?.label ?? "همه";

  const hasActiveFilters =
    consoleFilter !== "all" || debouncedQuery.length > 0;

  return (
    <div className="mt-8">
      <div ref={sentinelRef} className="h-px" aria-hidden />

      <div
        className={cn(
          "sticky top-20 z-30 -mx-2 mb-8 rounded-2xl border border-border bg-background/95 backdrop-blur-md transition-shadow duration-300 sm:-mx-0",
          isStuck && "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] ring-1 ring-border",
        )}
      >
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
          aria-expanded={isExpanded}
          aria-controls="cheat-filter-panel"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Filter className="h-4 w-4 text-cyan-400" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">فیلتر و جستجو</p>
              <p className="truncate text-xs text-muted">
                {activeConsoleLabel}
                {debouncedQuery ? ` · «${debouncedQuery}»` : ""}
                {" · "}
                {totalGames} بازی
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted transition-transform duration-300",
              isExpanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {!isExpanded ? (
          <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CONSOLE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setConsoleFilter(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                  consoleFilter === tab.id
                    ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                    : "border-border bg-surface text-muted hover:text-foreground",
                )}
              >
                {tab.icon ? (
                  <ConsoleTabIcon src={tab.icon} className="h-3.5 w-3.5" />
                ) : null}
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div
          id="cheat-filter-panel"
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
              <div className="flex flex-wrap gap-2">
                {CONSOLE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setConsoleFilter(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                      consoleFilter === tab.id
                        ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                        : "border-border bg-surface text-muted hover:border-border hover:text-foreground",
                    )}
                  >
                    {tab.icon ? (
                      <ConsoleTabIcon src={tab.icon} className="h-4 w-4" />
                    ) : null}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی بازی، ژانر یا کد چیت..."
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pe-10 ps-10 text-sm text-foreground placeholder:text-muted focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  aria-label="جستجو در چیت‌ها"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-muted"
                    aria-label="پاک کردن جستجو"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted">
                  دسترسی سریع — بخش‌ها
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {sectionLinks.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition hover:border-violet-500/40 hover:text-violet-300"
                    >
                      {section.title.replace("رمز و چیت ", "")}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted">
                  بازی‌های محبوب
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {popularGames.map((game) => (
                    <a
                      key={game.gameSlug}
                      href={cheatGamePath(game.gameSlug)}
                      className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:border-amber-500/40"
                    >
                      {game.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  {totalGames} بازی نمایش داده می‌شود
                </p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConsoleFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
                  >
                    پاک کردن فیلترها
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredSections.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <p className="text-lg font-semibold text-muted">نتیجه‌ای یافت نشد</p>
          <p className="mt-2 text-sm text-muted">
            فیلتر یا عبارت جستجو را تغییر دهید.
          </p>
        </div>
      ) : (
        filteredSections.map((section, index) => (
          <BlogCheatSectionDeferred
            key={section.id}
            section={section}
            index={index}
            postSlug={CHEAT_POST_SLUG}
          />
        ))
      )}
    </div>
  );
}

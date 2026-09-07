"use client";

import {
  formatRangeCompact,
  HOME_GAME_INSTALL_DISCOUNTED,
  type HomeGameInstallTab,
} from "@/lib/game-install-pricing";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const CONSOLE_TABS = [
  { id: "ps4", label: "PS4", href: "/services/game-install/ps4" },
  { id: "ps5", label: "PS5", href: "/services/game-install/ps5" },
  { id: "xbox", label: "Xbox", href: "/services/game-install/xbox-series" },
] as const;

const PriceTable = () => {
  const [activeTab, setActiveTab] = useState<HomeGameInstallTab>("ps5");
  const activeData = useMemo(
    () => HOME_GAME_INSTALL_DISCOUNTED[activeTab],
    [activeTab],
  );
  const activeHref = activeData.href;

  return (
    <div className="container mx-auto px-4 sm:px-6">
      <section className="mt-8 overflow-hidden rounded-2xl border border-cyan-400/30 bg-linear-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 p-4 sm:mt-10 sm:rounded-3xl sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-none px-1 pb-1 [&::-webkit-scrollbar]:hidden">
            {CONSOLE_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-cyan-400 text-black"
                      : "border border-white/15 bg-white/5 text-zinc-200 hover:border-cyan-300/40 hover:text-cyan-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex">
            <Link
              href={activeHref ?? "/services/game-install/ps5"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-300 sm:w-auto"
            >
              مشاهده تعرفه کامل
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 md:mt-6 md:p-5">
          <p className="text-lg font-black text-white">{activeData.title}</p>
          <p className="mt-2 text-sm leading-7 text-zinc-300">
            {activeData.description}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {activeData.highlights.map((item) => (
            <div
              key={item.title}
              className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-white/10 bg-black/25 p-5 sm:min-h-[190px] sm:p-6"
            >
              <p className="text-base font-semibold leading-7 text-zinc-200">
                {item.title}
              </p>
              <p className="mt-4 text-sm text-zinc-500 line-through decoration-red-400/70">
                {formatRangeCompact(item.previous)}
              </p>
              <p className="mt-1 text-2xl font-black text-cyan-300 sm:text-3xl">
                {formatRangeCompact(item.current)}
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-300">
                قیمت ویژه
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PriceTable;

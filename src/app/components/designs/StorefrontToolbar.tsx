"use client";

import { Search } from "lucide-react";
import { useId, type FormEvent, type ReactNode } from "react";

import BrowseLink from "@/app/components/designs/BrowseLink";
import { colorSwatch, swatchLoaderAccent } from "@/app/components/designs/browse-visuals";
import type { BrowseSort } from "@/lib/catalog/browse";
import { cn } from "@/lib/utils";

export type ToolbarColor = {
  id: string;
  label: string;
  href: string;
  active: boolean;
};

type Props = {
  colors: ToolbarColor[];
  sort: BrowseSort;
  onSort: (sort: BrowseSort) => void;
  searchValue: string;
  onSearchValue: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  actions?: ReactNode;
};

const swatchFace =
  "h-4 w-4 rounded-full border border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.45)]";

function ColorSwatchFace({ label }: { label: string }) {
  const swatch = colorSwatch(label);
  if (swatch === "split") {
    return (
      <span
        aria-hidden
        className={`${swatchFace} bg-[conic-gradient(#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7,#ef4444)]`}
      />
    );
  }
  if (swatch) {
    return <span aria-hidden className={swatchFace} style={{ backgroundColor: swatch }} />;
  }
  return <span className="text-[10px] text-muted">{label.slice(0, 1)}</span>;
}

const toolbarField =
  "min-h-11 rounded-xl border border-border bg-input-bg px-3 text-sm text-foreground outline-none focus:border-[#5145FF]";

export default function StorefrontToolbar({
  colors,
  sort,
  onSort,
  searchValue,
  onSearchValue,
  onSearch,
  actions,
}: Props) {
  const searchId = useId();
  const sortId = useId();

  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      <div className="flex flex-col gap-2">
        {colors.length > 0 ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xs font-bold text-muted">رنگ طرح</span>
            <ul
              className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-color:rgba(148,163,196,0.5)_transparent] [scrollbar-width:thin]"
              aria-label="رنگ طرح"
            >
              {colors.map((option) => (
                <li key={option.id} className="shrink-0">
                  <BrowseLink
                    href={option.href}
                    showLoader
                    loaderAccent={swatchLoaderAccent(option.label)}
                    aria-label={option.label}
                    aria-current={option.active ? "true" : undefined}
                    title={option.label}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full",
                      option.active && "ring-2 ring-[#5145FF]",
                    )}
                  >
                    <ColorSwatchFace label={option.label} />
                  </BrowseLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={sortId}>
            مرتب‌سازی
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(event) => onSort(event.target.value as BrowseSort)}
            className={`${toolbarField} min-w-[8.5rem]`}
          >
            <option value="featured">مرتب‌سازی</option>
            <option value="newest">جدیدترین</option>
            <option value="title">عنوان</option>
          </select>
          <form role="search" onSubmit={onSearch} className="min-w-[12rem] flex-1">
            <label htmlFor={searchId} className="sr-only">
              جستجوی طرح
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id={searchId}
                type="search"
                value={searchValue}
                onChange={(event) => onSearchValue(event.target.value)}
                placeholder="جستجوی طرح..."
                className={`${toolbarField} w-full ps-10`}
              />
            </div>
          </form>
          {actions}
        </div>
      </div>
    </div>
  );
}

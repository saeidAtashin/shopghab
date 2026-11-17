"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export type AdminSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onBlur?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export default function AdminSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled = false,
  onBlur,
  searchable = false,
  searchPlaceholder = "جستجو...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    if (!searchable) return options;
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
    );
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    const option = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    option?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openList() {
    if (disabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 240 && rect.top > spaceBelow);
    }
    setQuery("");
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  }

  function closeList() {
    setOpen(false);
    setQuery("");
  }

  function choose(next: string) {
    onChange(next);
    closeList();
    onBlur?.();
  }

  function moveActive(delta: number) {
    if (filtered.length === 0) return;
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return filtered.length - 1;
      if (next >= filtered.length) return 0;
      return next;
    });
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openList();
      }
      return;
    }

    handleListKeys(event);
  }

  function handleListKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeList();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(0, filtered.length - 1));
      return;
    }

    if (event.key === "Enter" || (event.key === " " && !searchable)) {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) choose(option.value);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onTriggerKeyDown}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (next && rootRef.current?.contains(next)) return;
          closeList();
          onBlur?.();
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-input-bg px-4 py-3 text-start outline-none focus:border-cyan-500 disabled:opacity-60",
          className,
        )}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "انتخاب"}</span>
        <ChevronDown
          aria-hidden
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute z-30 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/50",
            openUp ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          {searchable ? (
            <div className="border-b border-border p-2">
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleListKeys}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />
            </div>
          ) : null}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="max-h-60 overflow-auto p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">موردی پیدا نشد.</li>
            ) : (
              filtered.map((option, index) => {
                const active = index === activeIndex;
                const current = option.value === value;
                return (
                  <li key={option.value || "empty"} role="presentation">
                    <button
                      type="button"
                      role="option"
                      data-index={index}
                      aria-selected={current}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(option.value)}
                      className={cn(
                        "flex w-full rounded-xl px-3 py-2 text-start text-sm",
                        active
                          ? "bg-surface text-cyan-300"
                          : current
                            ? "text-cyan-300"
                            : "text-foreground hover:bg-surface",
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

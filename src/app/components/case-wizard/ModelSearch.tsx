"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { hasStrongModelMatch, searchPhoneModels } from "@/lib/cases/model-search";
import type { ModelSearchResult } from "@/lib/cases/model-search";
import { PhoneBackSvg } from "./PhoneBackSvg";
import ModelSearchNotFound from "./ModelSearchNotFound";

type Props = {
  brandSlug?: string;
  placeholder?: string;
  className?: string;
};

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

export default function ModelSearch({
  brandSlug,
  placeholder = "نام مدل گوشی را جستجو کنید…",
  className = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ModelSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }

    setResults(
      searchPhoneModels(debouncedQuery, {
        brandSlug,
        limit: 8,
      }),
    );
  }, [debouncedQuery, brandSlug]);

  const showNotFound =
    debouncedQuery.length >= MIN_QUERY_LENGTH &&
    !hasStrongModelMatch(debouncedQuery, { brandSlug });

  const showDropdown =
    open &&
    debouncedQuery.length >= MIN_QUERY_LENGTH &&
    results.length > 0;

  const handleSelect = useCallback(
    (result: ModelSearchResult) => {
      setOpen(false);
      setQuery("");
      router.push(`/phones/${result.model.brandSlug}/${result.model.slug}`);
    },
    [router],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
            if (event.key === "Enter" && results[0]) {
              event.preventDefault();
              handleSelect(results[0]);
            }
          }}
          placeholder={placeholder}
          aria-label="جستجوی مدل گوشی"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          className="w-full rounded-2xl border border-border bg-card/60 py-3.5 pl-4 pr-11 text-sm text-foreground placeholder:text-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {showDropdown ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl"
        >
          {results.map((result) => (
            <li key={`${result.model.brandSlug}-${result.model.slug}`} role="option">
              <Link
                href={`/phones/${result.model.brandSlug}/${result.model.slug}`}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface"
              >
                <div className="flex h-14 w-8 shrink-0 items-center justify-center">
                  <PhoneBackSvg model={result.model} className="h-full w-auto" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-sm font-bold text-foreground">{result.model.name}</p>
                  <p className="truncate text-xs text-muted">{result.model.nameEn}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-surface px-2 py-1 text-xs text-muted">
                  {result.brand.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {showNotFound && !showDropdown ? (
        <div className="mt-4">
          <ModelSearchNotFound query={debouncedQuery} />
        </div>
      ) : null}
    </div>
  );
}

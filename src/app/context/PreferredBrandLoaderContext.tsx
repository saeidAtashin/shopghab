"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  brandSlugFromHref,
  brandSlugFromPathname,
  getPreferredBrandLoaderSlug,
  setPreferredBrandLoaderSlug,
  type PreferredBrandLoaderSlug,
} from "@/lib/preferred-brand-loader";

type PreferredBrandLoaderContextValue = {
  preferredBrandSlug: PreferredBrandLoaderSlug;
  setPreferredBrandSlug: (slug: string) => PreferredBrandLoaderSlug;
};

const PreferredBrandLoaderContext = createContext<PreferredBrandLoaderContextValue | null>(null);

export function PreferredBrandLoaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [preferredBrandSlug, setPreferredBrandSlugState] = useState<PreferredBrandLoaderSlug>(null);

  useEffect(() => {
    setPreferredBrandSlugState(getPreferredBrandLoaderSlug());
  }, []);

  useEffect(() => {
    const brandFromRoute = brandSlugFromPathname(pathname);
    if (!brandFromRoute) return;

    setPreferredBrandSlugState((current) => {
      if (current === brandFromRoute) return current;
      return setPreferredBrandLoaderSlug(brandFromRoute);
    });
  }, [pathname]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const brandSlug = brandSlugFromHref(anchor.getAttribute("href"));
      if (!brandSlug) return;

      setPreferredBrandSlugState((current) => {
        if (current === brandSlug) return current;
        return setPreferredBrandLoaderSlug(brandSlug);
      });
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, []);

  const setPreferredBrandSlug = useCallback((slug: string) => {
    const next = setPreferredBrandLoaderSlug(slug);
    setPreferredBrandSlugState(next);
    return next;
  }, []);

  const value = useMemo(
    () => ({ preferredBrandSlug, setPreferredBrandSlug }),
    [preferredBrandSlug, setPreferredBrandSlug],
  );

  return (
    <PreferredBrandLoaderContext.Provider value={value}>
      {children}
    </PreferredBrandLoaderContext.Provider>
  );
}

export function usePreferredBrandLoader() {
  const context = useContext(PreferredBrandLoaderContext);
  if (!context) {
    throw new Error("usePreferredBrandLoader must be used within PreferredBrandLoaderProvider");
  }
  return context;
}

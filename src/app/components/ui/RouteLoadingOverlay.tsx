"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { usePreferredBrandLoader } from "@/app/context/PreferredBrandLoaderContext";
import {
  DEFAULT_ROUTE_LOADER_LABEL,
  DESIGN_ROUTE_LOADER_LABEL,
  subscribeRouteNavigation,
} from "@/lib/route-navigation";
import RouteLoaderSvg from "./RouteLoaderSvg";

const SHOW_DELAY_MS = 180;
const FAILSAFE_HIDE_MS = 8000;

function isInternalNavigationAnchor(element: HTMLAnchorElement) {
  const href = element.getAttribute("href") || "";

  if (!href || href.startsWith("#")) return false;
  if (element.target && element.target !== "_self") return false;
  if (element.hasAttribute("download")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  try {
    const url = new URL(href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isSamePathAndSearch =
      url.pathname === window.location.pathname &&
      url.search === window.location.search;
    const isHashOnly =
      isSamePathAndSearch && url.hash.length > 0;
    const isSameRouteNoNavigation =
      isSamePathAndSearch && (url.hash === "" || url.hash === window.location.hash);

    return isSameOrigin && !isHashOnly && !isSameRouteNoNavigation;
  } catch {
    return false;
  }
}

export default function RouteLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { preferredBrandSlug } = usePreferredBrandLoader();

  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState(DEFAULT_ROUTE_LOADER_LABEL);
  const [runId, setRunId] = useState(0);
  const pendingRef = useRef(false);
  const initialRouteRef = useRef(true);
  const showDelayRef = useRef<number | null>(null);
  const failsafeTimeoutRef = useRef<number | null>(null);
  const startLoaderRef = useRef<(nextLabel?: string) => void>(() => {});

  const clearTimers = () => {
    if (showDelayRef.current) {
      window.clearTimeout(showDelayRef.current);
      showDelayRef.current = null;
    }
    if (failsafeTimeoutRef.current) {
      window.clearTimeout(failsafeTimeoutRef.current);
      failsafeTimeoutRef.current = null;
    }
  };

  const startLoader = (nextLabel = DEFAULT_ROUTE_LOADER_LABEL) => {
    pendingRef.current = true;
    setLabel(nextLabel);
    if (showDelayRef.current) window.clearTimeout(showDelayRef.current);

    const delay = nextLabel === DESIGN_ROUTE_LOADER_LABEL ? 0 : SHOW_DELAY_MS;
    showDelayRef.current = window.setTimeout(() => {
      showDelayRef.current = null;
      if (!pendingRef.current) return;

      setRunId((value) => value + 1);
      setVisible(true);

      if (failsafeTimeoutRef.current) {
        window.clearTimeout(failsafeTimeoutRef.current);
      }
      failsafeTimeoutRef.current = window.setTimeout(() => {
        pendingRef.current = false;
        setVisible(false);
      }, FAILSAFE_HIDE_MS);
    }, delay);
  };
  startLoaderRef.current = startLoader;

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("[data-route-loader-ignore='true']")) {
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = target.closest("a");
      if (anchor instanceof HTMLAnchorElement && isInternalNavigationAnchor(anchor)) {
        startLoaderRef.current(
          anchor.getAttribute("data-route-loader-label") || DEFAULT_ROUTE_LOADER_LABEL,
        );
        return;
      }

      const button = target.closest(
        "button[data-route-loader-trigger='true'], [role='button'][data-route-loader-trigger='true']",
      );
      if (button) {
        startLoaderRef.current(
          button.getAttribute("data-route-loader-label") || DEFAULT_ROUTE_LOADER_LABEL,
        );
      }
    };

    const onPopState = () => {
      startLoaderRef.current();
    };

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (initialRouteRef.current) {
      initialRouteRef.current = false;
      return;
    }

    if (!pendingRef.current) return;

    pendingRef.current = false;
    clearTimers();
    setVisible(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    return subscribeRouteNavigation((nextLabel) => {
      startLoaderRef.current(nextLabel);
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="route-loader-overlay" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <RouteLoaderSvg brandSlug={preferredBrandSlug} runId={runId} />
        <p className="text-sm font-bold text-foreground">{label}</p>
      </div>
    </div>
  );
}

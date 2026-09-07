"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 520;
const FAILSAFE_HIDE_MS = 5000;

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

  const [visible, setVisible] = useState(false);
  const [runId, setRunId] = useState(0);
  const pendingRef = useRef(false);
  const startedAtRef = useRef(0);
  const initialRouteRef = useRef(true);
  const hideTimeoutRef = useRef<number | null>(null);
  const failsafeTimeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (failsafeTimeoutRef.current) {
      window.clearTimeout(failsafeTimeoutRef.current);
      failsafeTimeoutRef.current = null;
    }
  };

  const startLoader = () => {
    pendingRef.current = true;
    startedAtRef.current = Date.now();
    setRunId((value) => value + 1);
    setVisible(true);

    if (failsafeTimeoutRef.current) {
      window.clearTimeout(failsafeTimeoutRef.current);
    }
    failsafeTimeoutRef.current = window.setTimeout(() => {
      pendingRef.current = false;
      setVisible(false);
    }, FAILSAFE_HIDE_MS);
  };

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
        startLoader();
        return;
      }

      const button = target.closest(
        "button[data-route-loader-trigger='true'], [role='button'][data-route-loader-trigger='true']",
      );
      if (button) {
        startLoader();
      }
    };

    const onPopState = () => {
      startLoader();
    };

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (initialRouteRef.current) {
      initialRouteRef.current = false;
      return;
    }

    if (!pendingRef.current) return;

    pendingRef.current = false;
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, remaining);
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="route-loader-overlay" aria-hidden="true">
      <svg
        key={runId}
        className="route-loader-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 125"
      >
        <title>Loading</title>
        <path
          className="route-loader-path route-loader-path-1"
          pathLength={100}
          d="M24.14,41.26a1.5,1.5,0,0,1,1.48,1.48V57.27a1.5,1.5,0,0,1-1.48,1.48H9.61a1.5,1.5,0,0,1-1.48-1.48V42.73a1.5,1.5,0,0,1,1.48-1.48H24.14m0-2.22H9.61a3.71,3.71,0,0,0-3.69,3.69V57.27A3.71,3.71,0,0,0,9.61,61H24.14a3.71,3.71,0,0,0,3.69-3.69V42.73A3.71,3.71,0,0,0,24.14,39Z"
        />
        <path
          className="route-loader-path route-loader-path-2"
          pathLength={100}
          d="M61.21,41.26A8.74,8.74,0,1,1,52.46,50a8.75,8.75,0,0,1,8.74-8.74m0-2.22a11,11,0,1,0,11,11,11,11,0,0,0-11-11Z"
        />
        <path
          className="route-loader-path route-loader-path-3"
          pathLength={100}
          d="M84.61,50l9.16-9.16a1.05,1.05,0,0,0-1.49-1.49l-9.16,9.16L74,39.35a1.05,1.05,0,0,0-1.49,1.49L81.63,50l-9.16,9.16A1.05,1.05,0,1,0,74,60.65l9.16-9.16,9.16,9.16a1.05,1.05,0,0,0,1.49-1.49Z"
        />
        <path
          className="route-loader-path route-loader-path-4"
          pathLength={100}
          d="M39.79,42.39l7.9,16,.06.12H31.83l.06-.12,7.9-16m0-3.35c-.65,0-1.3.5-1.79,1.5l-8.29,16.8c-1,2,0,3.63,2.25,3.63H47.62c2.22,0,3.24-1.63,2.25-3.63l-8.29-16.8c-.49-1-1.14-1.5-1.79-1.5Z"
        />
      </svg>
    </div>
  );
}

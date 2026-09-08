"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDefaultInstallMethod,
  getInstallMethodsForConsole,
  isValidInstallMethod,
  type InstallMethodId,
} from "@/lib/game-install-quote";

const METHOD_CHANGED_EVENT = "game-install-method-changed";

function storageKey(consoleSlug: string): string {
  return `game-install-method-${consoleSlug}`;
}

export function readInstallMethod(consoleSlug: string): InstallMethodId {
  if (typeof window === "undefined") {
    return getDefaultInstallMethod(consoleSlug);
  }
  try {
    const raw = localStorage.getItem(storageKey(consoleSlug));
    if (raw && isValidInstallMethod(consoleSlug, raw)) {
      return raw;
    }
  } catch {
    // ignore
  }
  return getDefaultInstallMethod(consoleSlug);
}

export function writeInstallMethod(
  consoleSlug: string,
  methodId: InstallMethodId,
): void {
  localStorage.setItem(storageKey(consoleSlug), methodId);
  window.dispatchEvent(
    new CustomEvent(METHOD_CHANGED_EVENT, {
      detail: { consoleSlug, methodId },
    }),
  );
}

export function useInstallMethod(consoleSlug: string): [
  InstallMethodId,
  (methodId: InstallMethodId) => void,
] {
  const [methodId, setMethodId] = useState<InstallMethodId>(() =>
    getDefaultInstallMethod(consoleSlug),
  );

  useEffect(() => {
    setMethodId(readInstallMethod(consoleSlug));
  }, [consoleSlug]);

  useEffect(() => {
    const sync = () => setMethodId(readInstallMethod(consoleSlug));
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ consoleSlug: string }>).detail;
      if (detail?.consoleSlug === consoleSlug) sync();
    };
    window.addEventListener(METHOD_CHANGED_EVENT, onCustom);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(METHOD_CHANGED_EVENT, onCustom);
      window.removeEventListener("storage", sync);
    };
  }, [consoleSlug]);

  const setMethod = useCallback(
    (next: InstallMethodId) => {
      writeInstallMethod(consoleSlug, next);
      setMethodId(next);
    },
    [consoleSlug],
  );

  return [methodId, setMethod];
}

export function useInstallMethodId(consoleSlug: string): InstallMethodId {
  const [methodId] = useInstallMethod(consoleSlug);
  return methodId;
}

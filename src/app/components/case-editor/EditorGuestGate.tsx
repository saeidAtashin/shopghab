"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

import { lockPageScroll } from "@/lib/scroll-lock";

export const GUEST_EDIT_MESSAGE = "برای استفاده کامل، با شماره موبایل وارد شوید.";

type Gate = {
  requireAccount: (action: () => void) => void;
};

const EditorGuestGateContext = createContext<Gate>({
  requireAccount: (action) => {
    action();
  },
});

export function EditorGuestGateProvider({
  requireAccount,
  children,
}: {
  requireAccount: (action: () => void) => void;
  children: ReactNode;
}) {
  return (
    <EditorGuestGateContext.Provider value={{ requireAccount }}>
      {children}
    </EditorGuestGateContext.Provider>
  );
}

export function useGuestEditGate(): Gate {
  return useContext(EditorGuestGateContext);
}

export function GuestEditNotice({
  message,
  onDismiss,
  onLogin,
}: {
  message: string | null;
  onDismiss: () => void;
  onLogin: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    return lockPageScroll();
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-edit-notice-title"
        className="relative w-full max-w-md rounded-3xl border border-border bg-[#050816] p-8 text-center shadow-2xl"
      >
        <p id="guest-edit-notice-title" className="text-base font-bold leading-7 text-foreground">
          {message}
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-11 flex-1 rounded-xl border border-border px-4 text-sm font-bold text-foreground"
          >
            بستن
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="min-h-11 flex-1 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-black"
          >
            ورود
          </button>
        </div>
      </div>
    </div>
  );
}

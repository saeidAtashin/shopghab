"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  onDismiss: () => void;
};

export default function ShopToast({ message, onDismiss }: Props) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[150] -translate-x-1/2 rounded-xl border border-cyan-500/30 bg-card px-5 py-3 text-sm font-medium text-foreground shadow-xl"
    >
      {message}
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SlotSize = { width: number; height: number };

type Props = {
  children: ReactNode;
  className?: string;
};

function isInView(rect: DOMRect): boolean {
  return rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
}

export default function DockableAction({ children, className }: Props) {
  const slotRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef(false);
  const sizeRef = useRef<SlotSize>({ width: 0, height: 0 });
  const [floating, setFloating] = useState(false);
  const [slotSize, setSlotSize] = useState<SlotSize | null>(null);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const bar = barRef.current;
    if (!slot || !bar) return;

    const rememberSize = () => {
      if (floatingRef.current) return;
      const rect = slot.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width <= 0 || height <= 0) return;
      if (sizeRef.current.width === width && sizeRef.current.height === height) return;
      sizeRef.current = { width, height };
      setSlotSize(sizeRef.current);
    };

    const sync = () => {
      rememberSize();
      const next = sizeRef.current.height > 0 && !isInView(slot.getBoundingClientRect());
      if (floatingRef.current === next) return;
      floatingRef.current = next;
      setFloating(next);
    };

    sync();
    const observer = new IntersectionObserver(() => sync(), { threshold: [0, 1] });
    observer.observe(slot);
    document.addEventListener("scroll", sync, { passive: true, capture: true });
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("scroll", sync, { capture: true });
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div
      ref={slotRef}
      className={className}
      style={
        floating && slotSize
          ? { width: slotSize.width, height: slotSize.height }
          : undefined
      }
    >
      <div
        ref={barRef}
        className={cn(
          floating
            ? "fixed inset-x-0 bottom-0 z-40 flex justify-end border-t border-border bg-background/95 px-4 pt-3 shadow-[0_-12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] [&>a]:max-sm:w-full [&>button]:max-sm:w-full"
            : "contents",
        )}
      >
        {children}
      </div>
    </div>
  );
}

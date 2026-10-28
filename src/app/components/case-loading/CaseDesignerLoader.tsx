"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import ShopghabLoaderSvg from "@/app/components/ui/ShopghabLoaderSvg";
import { themeFromLocation } from "@/lib/case-loading/loader-theme";
import { lockPageScroll } from "@/lib/scroll-lock";

const SHOW_DELAY_MS = 180;
const FAILSAFE_HIDE_MS = 8000;

type Props = {
  previewReady: boolean;
};

export default function CaseDesignerLoader({ previewReady }: Props) {
  const pathname = usePathname();
  const theme = useMemo(() => themeFromLocation(pathname), [pathname]);
  const [armed, setArmed] = useState(false);
  const [runId, setRunId] = useState(0);
  const visible = !previewReady && armed;

  useEffect(() => {
    if (previewReady) return;

    const showTimer = window.setTimeout(() => {
      setRunId((value) => value + 1);
      setArmed(true);
    }, SHOW_DELAY_MS);
    const failsafe = window.setTimeout(() => {
      setArmed(false);
    }, FAILSAFE_HIDE_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(failsafe);
    };
  }, [previewReady]);

  useEffect(() => {
    if (!visible) return;
    return lockPageScroll();
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="route-loader-overlay pointer-events-auto"
      role="status"
      aria-live="polite"
      aria-busy
    >
      <span className="sr-only">در حال بارگذاری…</span>
      <ShopghabLoaderSvg runId={runId} theme={theme} />
    </div>
  );
}

"use client";

import { memo, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  ArrowLeft,
  Gamepad2,
  ShoppingBag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import HeroQuickAccessButton from "./HeroQuickAccessButton";
import {
  consoleIds,
  consoleCatalog,
  resolveConsoleServicePath,
  type ConsoleId,
  type ConsoleServiceKind,
} from "../../../../lib/console-catalog";
import { cn } from "@/lib/utils";
import "./hero-device-scene.css";

const consoleImages: Record<ConsoleId, string> = {
  ps4: "/obj-console/PS4-service-center-in-Delhi.webp",
  ps5: "/obj-console/ps5-repair.webp",
  xbox: "/obj-console/Series_X_Digital_Edition_Layout.jpg",
};

const consoleOptions: { id: ConsoleId; iconSrc: string }[] = [
  { id: "ps5", iconSrc: "/icons/ps5.svg" },
  { id: "ps4", iconSrc: "/icons/ps4.svg" },
  { id: "xbox", iconSrc: "/icons/xbox.svg" },
];

const serviceOptions: {
  id: ConsoleServiceKind;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "game-install", label: "نصب بازی", icon: Gamepad2 },
  { id: "repair", label: "تعمیرات", icon: Wrench },
  { id: "shop", label: "خرید", icon: ShoppingBag },
];

const PICKER_IMAGE_HEIGHT = 360;
const PICKER_IMAGE_HEIGHT_MOBILE = 210;
const PREVIEW_IMAGE_HEIGHT_MOBILE = 268;
const RAIL_WIDTH = 84;
const RAIL_WIDTH_SM = 72;
const MOBILE_CONSOLE_ROW_HEIGHT = 92;
const GLOW_BASE_SIZE = 320;
const DEFAULT_CONSOLE: ConsoleId = "ps5";

function useHeroViewport() {
  const [viewport, setViewport] = useState({
    isMobile: false,
    previewHeight: PICKER_IMAGE_HEIGHT,
    railWidth: RAIL_WIDTH_SM,
    pickerHeight: PICKER_IMAGE_HEIGHT,
  });

  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      const sm = window.matchMedia("(min-width: 640px)").matches;
      const xl = window.matchMedia("(min-width: 1280px)").matches;

      setViewport({
        isMobile: mobile,
        previewHeight: mobile
          ? PREVIEW_IMAGE_HEIGHT_MOBILE
          : xl
            ? 480
            : sm
              ? 420
              : PICKER_IMAGE_HEIGHT,
        railWidth: sm ? RAIL_WIDTH : RAIL_WIDTH_SM,
        pickerHeight: mobile ? PICKER_IMAGE_HEIGHT_MOBILE : PICKER_IMAGE_HEIGHT,
      });
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return viewport;
}

function usePickerPrimed() {
  const [primed, setPrimed] = useState(false);

  useEffect(() => {
    const prime = () => setPrimed(true);
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(prime, { timeout: 900 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(prime, 200);
    return () => clearTimeout(timer);
  }, []);

  return { primed, forcePrime: useCallback(() => setPrimed(true), []) };
}

function useHeroAssetPreload() {
  useEffect(() => {
    const urls = [
      ...new Set([...Object.values(consoleImages), ...consoleOptions.map((o) => o.iconSrc)]),
    ];

    const links: HTMLLinkElement[] = [];
    for (const href of urls) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = href.endsWith(".svg") ? "image" : "image";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    }

    consoleIds.forEach((id) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = consoleImages[id];
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, []);
}

type ConsoleButtonProps = {
  id: ConsoleId;
  iconSrc: string;
  active: boolean;
  label: string;
  variant: "rail" | "grid";
  onSelect: (id: ConsoleId) => void;
};

const ConsolePickerButton = memo(function ConsolePickerButton({
  id,
  iconSrc,
  active,
  label,
  variant,
  onSelect,
}: ConsoleButtonProps) {
  const isRail = variant === "rail";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(id)}
      className={cn(
        "hero-scene__picker-item group relative flex min-h-[44px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border transition-[color,box-shadow] duration-200",
        isRail
          ? "w-[4.5rem] gap-1 px-1.5 py-2 text-[10px] font-semibold sm:w-[5.25rem] sm:gap-1.5 sm:py-2.5 sm:text-xs"
          : "gap-0.5 px-1 py-2.5 text-[11px] font-semibold leading-tight",
        active
          ? "border-cyan-400/50 bg-cyan-500/25 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.35)]"
          : "border-white/15 bg-black/50 text-zinc-300 active:border-cyan-400/35 active:text-zinc-100 sm:hover:border-cyan-400/35 sm:hover:text-zinc-100 sm:hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-cyan-400/55 bg-cyan-500/25 shadow-[inset_0_0_24px_rgba(34,211,238,0.15)]"
        />
      )}
      <NextImage
        src={iconSrc}
        alt=""
        width={32}
        height={32}
        aria-hidden
        className={cn(
          "relative z-10 shrink object-cover invert transition-opacity duration-200",
          isRail
            ? "h-20 w-12 sm:h-24 sm:w-14 sm:group-hover:scale-105"
            : "h-14 w-9",
          active
            ? "opacity-100 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]"
            : "opacity-75 sm:opacity-70 sm:group-hover:opacity-95",
        )}
      />
      <span className="relative z-10 -mt-4 px-0.5 text-2xl text-cyan-300">
        {label}
      </span>
    </button>
  );
});

type ServicePickerButtonProps = {
  id: ConsoleServiceKind;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onSelect: (id: ConsoleServiceKind) => void;
};

const ServicePickerButton = memo(function ServicePickerButton({
  id,
  label,
  icon: Icon,
  active,
  onSelect,
}: ServicePickerButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(id)}
      className={cn(
        "hero-scene__picker-item group relative flex min-h-[52px] min-w-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border px-1 py-2 text-center transition-[color,box-shadow,background-color] duration-200 sm:min-h-[56px] sm:gap-1.5 sm:rounded-2xl sm:px-1 sm:py-1",
        active
          ? "border-cyan-400/55 bg-cyan-500/15 text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.32)]"
          : "border-white/10 bg-white/[0.04] text-zinc-200 active:border-cyan-400/35 sm:hover:border-cyan-400/35 sm:hover:bg-white/[0.07] sm:hover:shadow-[0_0_20px_rgba(34,211,238,0.14)]",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-cyan-400/45 bg-gradient-to-b from-cyan-500/20 via-cyan-500/10 to-cyan-900/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_24px_rgba(34,211,238,0.14)] sm:rounded-2xl"
        />
      )}
      <span
        className={cn(
          "relative z-10 flex h-7 w-7 items-center justify-center rounded-lg border bg-black/30 transition-[border-color,box-shadow,transform] duration-200 sm:h-8 sm:w-8",
          active
            ? "scale-105 border-cyan-400/45 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
            : "border-white/10",
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5 transition-colors duration-200 sm:h-4 sm:w-4",
            active
              ? "text-cyan-300"
              : "text-zinc-400 sm:group-hover:text-cyan-200/90",
          )}
          strokeWidth={active ? 2.25 : 1.75}
        />
      </span>
      <span
        className={cn(
          "relative z-10 text-[11px] font-semibold leading-tight transition-colors duration-200 sm:text-sm",
          active ? "text-cyan-100" : "sm:group-hover:text-cyan-100",
        )}
      >
        {label}
      </span>
    </button>
  );
});

export default function HeroDeviceScene() {
  const { isMobile, previewHeight, railWidth, pickerHeight } = useHeroViewport();
  const { primed: pickerPrimed, forcePrime } = usePickerPrimed();
  useHeroAssetPreload();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedConsole, setSelectedConsole] = useState<ConsoleId | null>(null);
  const [selectedService, setSelectedService] =
    useState<ConsoleServiceKind | null>(null);

  const glowSize = isPickerOpen
    ? isMobile
      ? 180
      : 320
    : Math.round(previewHeight * 0.79);

  const currentPath = useMemo(() => {
    if (!selectedConsole || !selectedService) return null;
    return resolveConsoleServicePath(selectedConsole, selectedService);
  }, [selectedConsole, selectedService]);

  const visibleConsole = selectedConsole ?? DEFAULT_CONSOLE;

  const centerLabel =
    selectedConsole && selectedService
      ? `${serviceOptions.find((s) => s.id === selectedService)?.label} ${consoleCatalog[selectedConsole].title}`
      : "";

  const togglePicker = useCallback(() => {
    forcePrime();
    setIsPickerOpen((prev) => !prev);
  }, [forcePrime]);

  const selectConsole = useCallback((id: ConsoleId) => setSelectedConsole(id), []);
  const selectService = useCallback(
    (id: ConsoleServiceKind) => setSelectedService(id),
    [],
  );

  const sceneStyle = {
    "--hero-preview-h": `${previewHeight}px`,
    "--hero-picker-h": `${pickerHeight}px`,
    "--hero-rail-w": `${railWidth}px`,
    "--hero-glow-scale": String(glowSize / GLOW_BASE_SIZE),
  } as React.CSSProperties;

  const consoleButtons = (variant: "rail" | "grid") =>
    consoleOptions.map(({ id, iconSrc }) => (
      <ConsolePickerButton
        key={`${variant}-${id}`}
        id={id}
        iconSrc={iconSrc}
        active={selectedConsole === id}
        label={consoleCatalog[id].title}
        variant={variant}
        onSelect={selectConsole}
      />
    ));

  return (
    <div
      className="hero-scene relative flex w-full items-start justify-center"
      data-picker-open={isPickerOpen}
      data-mobile={isMobile}
      style={sceneStyle}
    >
      <div className="hero-scene__rings absolute inset-0 hidden items-center justify-center sm:flex">
        <div className="h-[600px] w-[600px] rounded-full border border-cyan-400/10 xl:h-[720px] xl:w-[720px]" />
        <div className="absolute h-[500px] w-[500px] rounded-full border border-blue-400/10 xl:h-[600px] xl:w-[600px]" />
        <div className="absolute h-[380px] w-[380px] rounded-full border border-white/5 xl:h-[480px] xl:w-[480px]" />
      </div>

      <div className="hero-scene__tilt relative w-full max-w-[720px] xl:max-w-[820px]">
        <div className="hero-scene__card relative rounded-[22px] border border-white/10 p-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:rounded-[30px] sm:p-5 sm:shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
          <HeroQuickAccessButton
            onClick={togglePicker}
            isOpen={isPickerOpen}
            className="mb-2 sm:mb-3 sm:mt-[-10px]"
          />

          <div className="relative">
            <div className="flex w-full flex-col sm:flex-row-reverse sm:items-start sm:gap-4">
              <aside
                className="hero-scene__rail z-20 hidden sm:block"
                aria-hidden={!isPickerOpen || isMobile}
              >
                {pickerPrimed && !isMobile && (
                  <div
                    style={{ width: railWidth }}
                    className="mb-2 flex flex-col justify-center gap-2 sm:mb-2.5 sm:gap-2.5"
                  >
                    <p className="hero-scene__picker-label mb-2 text-center text-[10px] font-medium tracking-wide text-cyan-300/75 sm:mb-2.5 sm:text-xs">
                      انتخاب کنسول
                    </p>
                    {consoleButtons("rail")}
                  </div>
                )}
              </aside>

              <div className="flex min-w-0 flex-1 flex-col">
                <div
                  className={cn(
                    "hero-scene__collapse hero-scene__mobile-consoles overflow-hidden sm:hidden",
                    isPickerOpen && isMobile && "hero-scene__collapse--open",
                  )}
                  aria-hidden={!isPickerOpen || !isMobile}
                >
                  <div className="hero-scene__collapse-inner">
                    {pickerPrimed && isMobile && (
                      <div
                        className="grid grid-cols-3 gap-2"
                        style={{ minHeight: MOBILE_CONSOLE_ROW_HEIGHT }}
                      >
                        {consoleButtons("grid")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hero-scene__image-slot relative w-full overflow-hidden rounded-[18px] border border-white/10 bg-[#07101f] sm:rounded-[26px]">
                  <div className="hero-scene__glow" aria-hidden />

                  <div className="absolute inset-0">
                    {consoleIds.map((id) => (
                      <NextImage
                        key={id}
                        src={consoleImages[id]}
                        alt={
                          id === visibleConsole
                            ? consoleCatalog[id].title
                            : ""
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, 720px"
                        priority={id === DEFAULT_CONSOLE}
                        className={cn(
                          "hero-scene__photo object-cover",
                          visibleConsole === id
                            ? "z-[1] opacity-100"
                            : "z-0 opacity-0",
                        )}
                      />
                    ))}
                  </div>

                  <div
                    className={cn(
                      "hero-scene__cta",
                      currentPath && isPickerOpen && "hero-scene__cta--visible",
                    )}
                    aria-hidden={!(currentPath && isPickerOpen)}
                  >
                    {currentPath ? (
                      <Link
                        href={currentPath}
                        className="group flex max-w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/50 bg-cyan-500/20 px-4 py-3 text-center text-xs font-semibold leading-snug text-white shadow-[0_0_30px_rgba(34,211,238,0.35)] transition active:bg-cyan-500/35 sm:max-w-none sm:px-6 sm:py-3.5 sm:text-base sm:hover:bg-cyan-500/35"
                      >
                        <span className="min-w-0">{centerLabel}</span>
                        <ArrowLeft className="h-4 w-4 shrink-0 transition group-active:-translate-x-1 sm:group-hover:-translate-x-1" />
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div
                  className={cn(
                    "hero-scene__collapse hero-scene__services",
                    isPickerOpen && "hero-scene__collapse--open",
                  )}
                  aria-hidden={!isPickerOpen}
                >
                  <div className="hero-scene__collapse-inner">
                    {pickerPrimed && (
                      <>
                        <p className="hero-scene__picker-label mb-2 text-center text-[10px] font-medium tracking-wide text-cyan-300/75 sm:mb-2.5 sm:text-xs">
                          نوع سرویس را انتخاب کنید
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {serviceOptions.map(({ id, label, icon }) => (
                            <ServicePickerButton
                              key={id}
                              id={id}
                              label={label}
                              icon={icon}
                              active={selectedService === id}
                              onSelect={selectService}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

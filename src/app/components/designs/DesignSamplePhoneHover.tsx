"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import { getModelBySlug } from "@/lib/cases/brands.static";
import { designedAssetUrl } from "@/lib/designed-assets";
import { cn } from "@/lib/utils";

const HOVER_IPHONE_MODELS = [
  { brandSlug: "apple", modelSlug: "iphone-16-pro" },
  { brandSlug: "apple", modelSlug: "iphone-15-pro" },
  { brandSlug: "apple", modelSlug: "iphone-14-pro" },
  { brandSlug: "apple", modelSlug: "iphone-13" },
  { brandSlug: "apple", modelSlug: "iphone-12" },
] as const;

const designImageClassName = "h-full w-full object-cover object-center origin-center scale-[1.4]";

const slideTransition = {
  duration: 5,
  ease: "easeInOut" as const,
};

function hashTemplateId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickHoverIphoneModel(templateId: string) {
  const index = hashTemplateId(templateId) % HOVER_IPHONE_MODELS.length;
  const pick = HOVER_IPHONE_MODELS[index];
  return getModelBySlug(pick.brandSlug, pick.modelSlug);
}

type Props = {
  id: string;
  imageSrc: string;
  className?: string;
  active?: boolean;
};

type TrackSize = {
  trackW: number;
  trackH: number;
  phoneW: number;
  phoneH: number;
};

function axisTravel(active: boolean, shouldAnimate: boolean, distance: number): number | number[] {
  if (!active) return 0;
  if (shouldAnimate) return [0, distance, 0];
  return distance / 2;
}

export default function DesignSamplePhoneHover({
  id,
  imageSrc,
  className,
  active = false,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<TrackSize>({
    trackW: 200,
    trackH: 160,
    phoneW: 56,
    phoneH: 112,
  });
  const [portrait, setPortrait] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const model = pickHoverIphoneModel(id);
  const thumbnailSrc = designedAssetUrl(imageSrc);

  useEffect(() => {
    const image = trackRef.current?.querySelector("img");
    if (image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0) {
      setPortrait(image.naturalHeight > image.naturalWidth);
      return;
    }
    setPortrait(false);
  }, [thumbnailSrc]);

  useEffect(() => {
    if (!model) return;

    const track = trackRef.current;
    const phone = phoneRef.current;
    if (!track || !phone) return;

    const update = () => {
      setSize({
        trackW: track.clientWidth,
        trackH: track.clientHeight,
        phoneW: phone.offsetWidth,
        phoneH: phone.offsetHeight,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(track);
    ro.observe(phone);
    return () => ro.disconnect();
  }, [model]);

  if (!model) {
    return null;
  }

  const maxX = Math.max(0, size.trackW - size.phoneW);
  const maxY = Math.max(0, size.trackH - size.phoneH);
  const canTravel = portrait ? maxX > 0 || maxY > 0 : maxX > 0;
  const shouldAnimate = active && canTravel && !prefersReducedMotion;

  const phoneX = axisTravel(active, shouldAnimate, maxX);
  const syncX = axisTravel(active, shouldAnimate, -maxX);
  const phoneY = portrait ? axisTravel(active, shouldAnimate, maxY) : "-50%";
  const syncY = portrait ? axisTravel(active, shouldAnimate, -maxY) : "-50%";

  function rememberOrientation(event: SyntheticEvent<HTMLImageElement>): void {
    const image = event.currentTarget;
    setPortrait(image.naturalHeight > image.naturalWidth);
  }

  return (
    <div
      ref={trackRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={thumbnailSrc}
          alt=""
          width={280}
          height={560}
          className={designImageClassName}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          onLoad={rememberOrientation}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-background/40" aria-hidden />

      <motion.div
        ref={phoneRef}
        className={cn("absolute left-0 z-[1] w-14 shrink-0 sm:w-16", portrait ? "top-0" : "top-1/2")}
        style={portrait ? undefined : { y: "-50%" }}
        animate={portrait ? { x: phoneX, y: phoneY } : { x: phoneX }}
        transition={{
          ...slideTransition,
          repeat: shouldAnimate ? Infinity : 0,
        }}
      >
        <div
          className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-black/20 blur-3xl dark:bg-black/45"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -inset-3 rounded-[1.35rem] bg-black/10 blur-xl dark:bg-black/25"
          aria-hidden
        />

        <div
          className="relative rounded-[1.15rem] p-1 shadow-[0_10px_28px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)]"
          style={{ aspectRatio: `${model.canvasWidth}/${model.canvasHeight}` }}
        >
          <div className="absolute inset-[3px] overflow-hidden rounded-[0.85rem] bg-[#0a0a0f]">
            <motion.div
              className={cn("absolute left-0", portrait ? "top-0" : "top-1/2")}
              style={
                portrait
                  ? { width: size.trackW, height: size.trackH }
                  : { width: size.trackW, height: size.trackH, y: "-50%" }
              }
              animate={portrait ? { x: syncX, y: syncY } : { x: syncX }}
              transition={{
                ...slideTransition,
                repeat: shouldAnimate ? Infinity : 0,
              }}
            >
              <Image
                src={thumbnailSrc}
                alt=""
                width={280}
                height={560}
                className={designImageClassName}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </motion.div>
          </div>

          <PhoneBackSvg
            model={model}
            className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-md"
            bodyFill="transparent"
            showCamera
          />
        </div>
      </motion.div>
    </div>
  );
}

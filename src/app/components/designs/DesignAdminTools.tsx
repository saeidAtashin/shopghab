"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { adminJson } from "@/app/components/admin/AdminShell";
import { ensureCatalogCookie } from "@/lib/auth-api";
import { designedAssetUrl } from "@/lib/designed-assets";
import {
  clampPlacementZoom,
  coverCropRect,
  MAX_PLACEMENT_ZOOM,
  MIN_PLACEMENT_ZOOM,
} from "@/lib/mockups/focal";

type Artwork = { src: string; thumb: string; width: number; height: number };

export type DesignPlacementTemplate = {
  templateId: string;
  name: string;
  printableWidth: number;
  printableHeight: number;
  focalX: number;
  focalY: number;
  zoom: number;
  rendered: string;
  thumb: string;
  generatedAt: string;
  error: string;
};

type PlacementView = {
  artwork: Artwork;
  templates: DesignPlacementTemplate[];
};

type Focal = { x: number; y: number; zoom: number };

const ZOOM_STEP = 0.25;

type Point = { x: number; y: number };
type Gesture =
  | { kind: "pan"; x: number; y: number; focalX: number; focalY: number; zoom: number }
  | { kind: "pinch"; distance: number; focalX: number; focalY: number; zoom: number };

function pointerDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function versioned(src: string, version: string): string {
  if (!src) return "";
  const url = designedAssetUrl(src);
  if (!version) return url;
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}v=${encodeURIComponent(version)}`;
}

function CropFrame({
  src,
  artWidth,
  artHeight,
  regionWidth,
  regionHeight,
  focalX,
  focalY,
  zoom,
  onChange,
}: {
  src: string;
  artWidth: number;
  artHeight: number;
  regionWidth: number;
  regionHeight: number;
  focalX: number;
  focalY: number;
  zoom: number;
  onChange: (focalX: number, focalY: number, zoom: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const placementRef = useRef({ focalX, focalY, zoom });
  const onChangeRef = useRef(onChange);
  placementRef.current = { focalX, focalY, zoom };
  onChangeRef.current = onChange;

  const safeWidth = Math.max(1, regionWidth);
  const safeHeight = Math.max(1, regionHeight);
  const crop = coverCropRect(artWidth, artHeight, safeWidth, safeHeight, { focalX, focalY, zoom });
  const centered = Math.abs(focalX - 0.5) < 0.0001 && Math.abs(focalY - 0.5) < 0.0001 && zoom <= MIN_PLACEMENT_ZOOM + 0.0001;

  function emit(nextX: number, nextY: number, nextZoom: number) {
    const placement = { focalX: nextX, focalY: nextY, zoom: clampPlacementZoom(nextZoom) };
    placementRef.current = placement;
    onChangeRef.current(placement.focalX, placement.focalY, placement.zoom);
  }

  function beginGesture() {
    const points = [...pointers.current.values()];
    const current = placementRef.current;
    if (points.length >= 2) {
      const first = points[0];
      const second = points[1];
      if (!first || !second) return;
      gesture.current = {
        kind: "pinch",
        distance: Math.max(1, pointerDistance(first, second)),
        focalX: current.focalX,
        focalY: current.focalY,
        zoom: current.zoom,
      };
      return;
    }
    const only = points[0];
    if (only) {
      gesture.current = {
        kind: "pan",
        x: only.x,
        y: only.y,
        focalX: current.focalX,
        focalY: current.focalY,
        zoom: current.zoom,
      };
      return;
    }
    gesture.current = null;
  }

  function applyPan(clientX: number, clientY: number) {
    const currentGesture = gesture.current;
    if (!currentGesture || currentGesture.kind !== "pan") return;
    const bounds = frameRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width < 1 || bounds.height < 1) return;
    const start = coverCropRect(artWidth, artHeight, safeWidth, safeHeight, {
      focalX: currentGesture.focalX,
      focalY: currentGesture.focalY,
      zoom: currentGesture.zoom,
    });
    const maxLeft = start.resizedWidth - start.width;
    const maxTop = start.resizedHeight - start.height;
    const dx = (clientX - currentGesture.x) / bounds.width;
    const dy = (clientY - currentGesture.y) / bounds.height;
    const nextLeft = Math.min(Math.max(0, start.left - dx * safeWidth), maxLeft);
    const nextTop = Math.min(Math.max(0, start.top - dy * safeHeight), maxTop);
    emit(
      maxLeft < 0.5 ? 0.5 : nextLeft / maxLeft,
      maxTop < 0.5 ? 0.5 : nextTop / maxTop,
      currentGesture.zoom,
    );
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    beginGesture();
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const currentGesture = gesture.current;
    if (!currentGesture) return;
    if (currentGesture.kind === "pinch") {
      const points = [...pointers.current.values()];
      const first = points[0];
      const second = points[1];
      if (!first || !second) return;
      const nextDistance = Math.max(1, pointerDistance(first, second));
      emit(
        currentGesture.focalX,
        currentGesture.focalY,
        currentGesture.zoom * (nextDistance / currentGesture.distance),
      );
      return;
    }
    applyPan(event.clientX, event.clientY);
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    beginGesture();
  }

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const current = placementRef.current;
      const direction = event.deltaY < 0 ? 1 : -1;
      const nextZoom = clampPlacementZoom(current.zoom + direction * ZOOM_STEP);
      placementRef.current = { focalX: current.focalX, focalY: current.focalY, zoom: nextZoom };
      onChangeRef.current(current.focalX, current.focalY, nextZoom);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div>
      <div
        ref={frameRef}
        role="application"
        aria-label="جابه‌جایی و بزرگ‌نمایی عکس داخل کادر چاپ"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className="relative mx-auto cursor-grab touch-none overflow-hidden rounded-xl border border-cyan-300/70 bg-black/40 active:cursor-grabbing"
        style={{
          aspectRatio: `${safeWidth} / ${safeHeight}`,
          width: `min(100%, calc(22rem * ${safeWidth} / ${safeHeight}))`,
        }}
      >
        <img
          src={designedAssetUrl(src)}
          alt=""
          draggable={false}
          className="pointer-events-none absolute top-0 left-0 max-w-none select-none"
          style={{
            width: `${(crop.resizedWidth / safeWidth) * 100}%`,
            height: "auto",
            transform: `translate(${(-crop.left / crop.resizedWidth) * 100}%, ${(-crop.top / crop.resizedHeight) * 100}%)`,
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="کوچک‌نمایی"
          disabled={zoom <= MIN_PLACEMENT_ZOOM + 0.0001}
          onClick={() => emit(focalX, focalY, zoom - ZOOM_STEP)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-12 text-center text-xs text-muted">{Math.round(zoom * 100)}٪</span>
        <button
          type="button"
          aria-label="بزرگ‌نمایی"
          disabled={zoom >= MAX_PLACEMENT_ZOOM - 0.0001}
          onClick={() => emit(focalX, focalY, zoom + ZOOM_STEP)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          disabled={centered}
          onClick={() => emit(0.5, 0.5, MIN_PLACEMENT_ZOOM)}
          className="rounded-lg border border-border px-2 py-1 text-xs text-muted disabled:opacity-40"
        >
          بازنشانی
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        کادر همان بخش چاپ‌شونده داخل PSD است. عکس را بکشید و برای برش دقیق‌تر بزرگ‌نمایی کنید.
      </p>
    </div>
  );
}

export default function DesignAdminTools({ designId }: { designId: string }) {
  const router = useRouter();
  const [view, setView] = useState<PlacementView | null>(null);
  const [focals, setFocals] = useState<Record<string, Focal>>({});
  const [artSize, setArtSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const allowed = await ensureCatalogCookie();
        if (!allowed) throw new Error("نشست ادمین برقرار نشد");
        const body = await adminJson<PlacementView>(`/api/admin/catalog/designs/${designId}/placement`);
        if (cancelled) return;
        setView(body);
        setArtSize({
          width: body.artwork.width > 0 ? body.artwork.width : 0,
          height: body.artwork.height > 0 ? body.artwork.height : 0,
        });
        setFocals(
          Object.fromEntries(
            body.templates.map((item) => [item.templateId, { x: item.focalX, y: item.focalY, zoom: item.zoom || 1 }]),
          ),
        );
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "بارگذاری ابزار ادمین انجام نشد");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [designId]);

  async function apply(template: DesignPlacementTemplate) {
    const focal = focals[template.templateId] ?? { x: template.focalX, y: template.focalY, zoom: template.zoom || 1 };
    setPendingId(template.templateId);
    setError(null);
    try {
      const allowed = await ensureCatalogCookie();
      if (!allowed) throw new Error("نشست ادمین برقرار نشد");
      const body = await adminJson<{ template: DesignPlacementTemplate }>(
        `/api/admin/catalog/designs/${designId}/placement`,
        {
          method: "POST",
          body: JSON.stringify({
            templateId: template.templateId,
            focalX: focal.x,
            focalY: focal.y,
            zoom: focal.zoom,
          }),
        },
      );
      setView((current) =>
        current
          ? {
              ...current,
              templates: current.templates.map((item) =>
                item.templateId === body.template.templateId ? body.template : item,
              ),
            }
          : current,
      );
      setFocals((current) => ({
        ...current,
        [body.template.templateId]: { x: body.template.focalX, y: body.template.focalY, zoom: body.template.zoom || 1 },
      }));
      router.refresh();
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "رندر موکاپ انجام نشد");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 sm:p-6" aria-labelledby="admin-design-tools">
      <h2 id="admin-design-tools" className="text-lg font-black text-cyan-300">
        جای عکس در PSD
      </h2>
      <p className="mt-2 text-sm text-muted">عکس اصلی و جای آن داخل موکاپ هر PSD فقط برای همین طرح عوض می‌شود.</p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-muted">در حال بارگذاری تصویرها…</p> : null}
      {view ? (
        <div className="mt-6 grid gap-6">
          <figure>
            <figcaption className="mb-2 text-sm font-bold">طرح اصلی</figcaption>
            <img
              src={designedAssetUrl(view.artwork.src)}
              alt="طرح اصلی"
              className="max-h-80 w-full rounded-xl border border-border bg-card/40 object-contain"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (artSize.width > 0 && artSize.height > 0) return;
                setArtSize({ width: image.naturalWidth, height: image.naturalHeight });
              }}
            />
          </figure>
          <div className="grid gap-6 lg:grid-cols-3">
            {view.templates.map((template) => {
              const focal = focals[template.templateId] ?? {
                x: template.focalX,
                y: template.focalY,
                zoom: template.zoom || 1,
              };
              const dirty =
                !template.rendered ||
                Math.abs(focal.x - template.focalX) > 0.0001 ||
                Math.abs(focal.y - template.focalY) > 0.0001 ||
                Math.abs(focal.zoom - (template.zoom || 1)) > 0.0001;
              const width = artSize.width > 0 ? artSize.width : 1;
              const height = artSize.height > 0 ? artSize.height : 1;
              return (
                <article key={template.templateId} className="rounded-2xl border border-border bg-background/60 p-3">
                  <h3 className="text-sm font-bold">{template.name}</h3>
                  <p className="mt-1 text-xs text-muted">رندر شده</p>
                  {template.rendered ? (
                    <img
                      src={versioned(template.rendered, template.generatedAt)}
                      alt=""
                      className="mt-2 aspect-[3/2] w-full rounded-xl bg-card/40 object-contain"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-muted">هنوز موکاپی برای این PSD ساخته نشده.</p>
                  )}
                  {template.error ? <p className="mt-2 text-xs text-red-300">{template.error}</p> : null}
                  <div className="mt-3">
                    <CropFrame
                      src={view.artwork.src}
                      artWidth={width}
                      artHeight={height}
                      regionWidth={template.printableWidth}
                      regionHeight={template.printableHeight}
                      focalX={focal.x}
                      focalY={focal.y}
                      zoom={focal.zoom}
                      onChange={(x, y, nextZoom) =>
                        setFocals((current) => ({ ...current, [template.templateId]: { x, y, zoom: nextZoom } }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!dirty || pendingId !== null}
                    onClick={() => void apply(template)}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pendingId === template.templateId ? "در حال رندر…" : "اعمال"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

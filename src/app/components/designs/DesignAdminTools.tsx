"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { adminJson } from "@/app/components/admin/AdminShell";
import { ensureCatalogCookie } from "@/lib/auth-api";
import { designedAssetUrl } from "@/lib/designed-assets";
import { coverWindowFractions } from "@/lib/mockups/focal";

type Artwork = { src: string; thumb: string; width: number; height: number };

export type DesignPlacementTemplate = {
  templateId: string;
  name: string;
  printableWidth: number;
  printableHeight: number;
  focalX: number;
  focalY: number;
  rendered: string;
  thumb: string;
  generatedAt: string;
  error: string;
};

type PlacementView = {
  artwork: Artwork;
  templates: DesignPlacementTemplate[];
};

type Focal = { x: number; y: number };

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
  onChange,
}: {
  src: string;
  artWidth: number;
  artHeight: number;
  regionWidth: number;
  regionHeight: number;
  focalX: number;
  focalY: number;
  onChange: (focalX: number, focalY: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const crop = coverWindowFractions(artWidth, artHeight, regionWidth, regionHeight);
  const left = focalX * (1 - crop.width);
  const top = focalY * (1 - crop.height);
  const movable = crop.width < 0.995 || crop.height < 0.995;

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!movable) return;
    const bounds = frameRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width < 1 || bounds.height < 1) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = left;
    const startTop = top;

    function move(ev: PointerEvent) {
      const dx = (ev.clientX - startX) / bounds!.width;
      const dy = (ev.clientY - startY) / bounds!.height;
      const nextLeft = Math.min(Math.max(0, startLeft + dx), 1 - crop.width);
      const nextTop = Math.min(Math.max(0, startTop + dy), 1 - crop.height);
      const nextX = crop.width >= 0.995 ? 0.5 : nextLeft / (1 - crop.width);
      const nextY = crop.height >= 0.995 ? 0.5 : nextTop / (1 - crop.height);
      onChange(nextX, nextY);
    }

    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div>
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden rounded-xl bg-black/40"
        style={{ aspectRatio: `${artWidth} / ${artHeight}` }}
      >
        <img src={designedAssetUrl(src)} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <div
          role="slider"
          aria-label="جابه‌جایی کادر چاپ"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(focalX * 100)}
          tabIndex={0}
          onPointerDown={onPointerDown}
          className={`absolute border-2 border-cyan-300 bg-cyan-400/20 ${
            movable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          }`}
          style={{
            left: `${left * 100}%`,
            top: `${top * 100}%`,
            width: `${crop.width * 100}%`,
            height: `${crop.height * 100}%`,
            touchAction: "none",
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        {movable ? "کادر روشن همان بخشی است که داخل PSD چاپ می‌شود. آن را بکشید." : "نسبت این PSD با عکس یکی است و برشی برای جابه‌جایی نمانده."}
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
          Object.fromEntries(body.templates.map((item) => [item.templateId, { x: item.focalX, y: item.focalY }])),
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
    const focal = focals[template.templateId] ?? { x: template.focalX, y: template.focalY };
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
        [body.template.templateId]: { x: body.template.focalX, y: body.template.focalY },
      }));
      router.refresh();
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "رندر موکاپ انجام نشد");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="mt-12 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 sm:p-6" aria-labelledby="admin-design-tools">
      <h2 id="admin-design-tools" className="text-lg font-black text-cyan-300">
        ابزار ادمین
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
              const focal = focals[template.templateId] ?? { x: template.focalX, y: template.focalY };
              const dirty =
                !template.rendered ||
                Math.abs(focal.x - template.focalX) > 0.0001 ||
                Math.abs(focal.y - template.focalY) > 0.0001;
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
                      onChange={(x, y) => setFocals((current) => ({ ...current, [template.templateId]: { x, y } }))}
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

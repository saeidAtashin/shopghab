"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { Lock, LockOpen, RotateCw, Trash2 } from "lucide-react";
import type Konva from "konva";

import { PhoneBackKonvaLayers } from "@/app/components/case-wizard/PhoneBackKonva";
import {
  createCaseDesignClipFunc,
  createFallbackCaseDesignClipFunc,
  mapGeometryToCanvas,
} from "@/lib/cases/phone-back";
import { useEditorStore } from "@/lib/design/editor-store";
import { STAGE_EXPORT_CROP_ATTR } from "@/lib/design/export";
import {
  fitSelectionView,
  resizeFromHandle,
  rotationKeepingCenter,
  selectionLocalFrame,
  worldPoint,
  type ResizeHandle,
} from "@/lib/design/selection-view";
import {
  findTextureImage,
  isLayerLocked,
  isLayerVisible,
  type DesignLayer,
} from "@/lib/design/types";
import DesignImageLayerNode from "@/app/components/case-editor/DesignImageLayerNode";
import TextLayerNode from "@/app/components/case-editor/TextLayerNode";

type Props = {
  caseColor: string;
  caseMaterial: string;
  onStageRef?: (stage: Konva.Stage | null) => void;
  readOnly?: boolean;
  displayMaxWidth?: number;
  displayMaxHeight?: number;
  mobileTouchMode?: boolean;
};

type TouchGesture = {
  layerId: string;
  startDistance: number;
  startAngle: number;
  startScaleX: number;
  startScaleY: number;
  startRotation: number;
};

type LayerHandlers = {
  onClick: () => void;
  onTap: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
  onTouchStart: (e: Konva.KonvaEventObject<TouchEvent>) => void;
  onTouchMove: (e: Konva.KonvaEventObject<TouchEvent>) => void;
  draggable: boolean;
};

function touchDistance(t1: Touch, t2: Touch): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.hypot(dx, dy);
}

function touchAngle(t1: Touch, t2: Touch): number {
  return (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) / Math.PI;
}

const CHROME_PAD = 12;
const ACTION_GAP = 6;
const RESIZE_HANDLES: ResizeHandle[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "middle-left",
  "middle-right",
  "middle-top",
  "middle-bottom",
];

type ChromeGesture =
  | {
      kind: "rotate";
      startAngle: number;
      startRotation: number;
      centerX: number;
      centerY: number;
      vx: number;
      vy: number;
    }
  | { kind: "resize"; handle: ResizeHandle };

function sameWidths(left: number[] | null, right: number[] | null): boolean {
  if (left === right) return true;
  if (!left || !right || left.length !== right.length) return false;
  return left.every((width, index) => width === right[index]);
}

function readTextLineWidths(text: Konva.Text | undefined): number[] | null {
  const lines = (text as (Konva.Text & { textArr?: Array<{ width: number }> }) | undefined)
    ?.textArr;
  if (!lines?.length) return null;
  return lines.map((line) => line.width);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function CaseCanvas({
  caseColor,
  caseMaterial,
  onStageRef,
  readOnly = false,
  displayMaxWidth,
  displayMaxHeight,
  mobileTouchMode = false,
}: Props) {
  const stageRef = useRef<Konva.Stage>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchGestureRef = useRef<TouchGesture | null>(null);
  const chromeGestureRef = useRef<ChromeGesture | null>(null);
  const chromeMovedRef = useRef(false);

  const layers = useEditorStore((s) => s.document.layers);
  const canvasWidth = useEditorStore((s) => s.document.canvas.width);
  const canvasHeight = useEditorStore((s) => s.document.canvas.height);
  const meta = useEditorStore((s) => s.meta);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const previewMode = useEditorStore((s) => s.previewMode);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const setLayerVisible = useEditorStore((s) => s.setLayerVisible);
  const commitHistory = useEditorStore((s) => s.commitHistory);
  const [textLineWidths, setTextLineWidths] = useState<number[] | null>(null);
  const [fontEpoch, setFontEpoch] = useState(0);
  const textLineWidthsRef = useRef<number[] | null>(null);
  textLineWidthsRef.current = textLineWidths;

  const width = meta?.canvasWidth ?? canvasWidth;
  const height = meta?.canvasHeight ?? canvasHeight;
  const maxW = displayMaxWidth ?? 280;
  const maxH = displayMaxHeight ?? 480;
  const isClear = caseMaterial === "clear";
  const interactive = !readOnly && !previewMode;
  const selectedLayer = selectedLayerId
    ? layers.find((layer) => layer.id === selectedLayerId) ?? null
    : null;
  const view = fitSelectionView({
    canvasWidth: width,
    canvasHeight: height,
    maxWidth: maxW,
    maxHeight: maxH,
  });
  const layoutWidth = view.phoneCrop.width + CHROME_PAD * 2;
  const layoutHeight = view.phoneCrop.height + CHROME_PAD * 2;
  const stageLeft = CHROME_PAD - view.phoneCrop.x;
  const stageTop = CHROME_PAD - view.phoneCrop.y;
  const model = meta?.model;
  const designClipFunc = model
    ? createCaseDesignClipFunc(mapGeometryToCanvas(model))
    : createFallbackCaseDesignClipFunc(width, height);

  const visibleLayers = layers.filter(isLayerVisible);
  const layerIds = useMemo(
    () => visibleLayers.map((layer) => layer.id).join(","),
    [visibleLayers],
  );

  useEffect(() => {
    if (stageRef.current) onStageRef?.(stageRef.current);
  }, [onStageRef]);

  const selectedLayerRef = useRef(selectedLayer);
  const canvasWidthRef = useRef(width);
  const viewRef = useRef(view);
  const stagePosRef = useRef({ left: stageLeft, top: stageTop });
  selectedLayerRef.current = selectedLayer;
  canvasWidthRef.current = width;
  viewRef.current = view;
  stagePosRef.current = { left: stageLeft, top: stageTop };

  useLayoutEffect(() => {
    stageRef.current?.setAttr(STAGE_EXPORT_CROP_ATTR, view.phoneCrop);
  }, [view.phoneCrop]);

  useEffect(() => {
    const fonts = document.fonts;
    if (!fonts) return;
    let cancelled = false;
    const refresh = () => {
      if (!cancelled) setFontEpoch((epoch) => epoch + 1);
    };
    void fonts.ready.then(refresh);
    fonts.addEventListener("loadingdone", refresh);
    return () => {
      cancelled = true;
      fonts.removeEventListener("loadingdone", refresh);
    };
  }, []);

  useLayoutEffect(() => {
    if (!selectedLayer || selectedLayer.type !== "text") {
      setTextLineWidths((current) => (current ? null : current));
      return;
    }
    const group = stageRef.current?.findOne(`#${selectedLayer.id}`);
    const text = group?.findOne<Konva.Text>("Text");
    (text as (Konva.Text & { _setTextData?: () => void }) | undefined)?._setTextData?.();
    const next = readTextLineWidths(text);
    setTextLineWidths((current) => (sameWidths(current, next) ? current : next));
  }, [fontEpoch, selectedLayer]);

  const clientToCanvas = useCallback((clientX: number, clientY: number) => {
    const host = wrapperRef.current;
    const current = viewRef.current;
    const stagePos = stagePosRef.current;
    if (!host) return { x: 0, y: 0 };
    const rect = host.getBoundingClientRect();
    return {
      x: (clientX - rect.left - stagePos.left) / current.scale - current.offsetX,
      y: (clientY - rect.top - stagePos.top) / current.scale - current.offsetY,
    };
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const gesture = chromeGestureRef.current;
      const layer = selectedLayerRef.current;
      if (!gesture || !layer || isLayerLocked(layer)) return;
      const point = clientToCanvas(event.clientX, event.clientY);
      chromeMovedRef.current = true;
      if (gesture.kind === "rotate") {
        const angle =
          (Math.atan2(point.y - gesture.centerY, point.x - gesture.centerX) * 180) / Math.PI;
        updateLayer(
          layer.id,
          rotationKeepingCenter({
            rotation: gesture.startRotation + (angle - gesture.startAngle),
            centerX: gesture.centerX,
            centerY: gesture.centerY,
            vx: gesture.vx,
            vy: gesture.vy,
          }),
          { recordHistory: false },
        );
        return;
      }
      const frame = selectionLocalFrame(
        layer,
        canvasWidthRef.current,
        textLineWidthsRef.current,
      );
      updateLayer(
        layer.id,
        resizeFromHandle({
          handle: gesture.handle,
          pointerX: point.x,
          pointerY: point.y,
          x: layer.x,
          y: layer.y,
          rotation: layer.rotation,
          scaleX: layer.scaleX,
          scaleY: layer.scaleY,
          lockAspect: layer.type === "image",
          ...frame,
        }),
        { recordHistory: false },
      );
    };
    const end = () => {
      if (chromeGestureRef.current && chromeMovedRef.current) commitHistory();
      chromeGestureRef.current = null;
      chromeMovedRef.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [clientToCanvas, commitHistory, updateLayer]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly || previewMode) return;
    const stage = e.target.getStage();
    if (!stage || e.target === stage) {
      selectLayer(null);
      return;
    }
    const ids = new Set(layers.map((layer) => layer.id));
    let node: Konva.Node | null = e.target;
    while (node && node !== stage) {
      const id = node.id();
      if (id && ids.has(id)) return;
      node = node.getParent();
    }
    selectLayer(null);
  };

  const handleTouchStart = useCallback(
    (layerId: string, e: Konva.KonvaEventObject<TouchEvent>) => {
      if (readOnly || previewMode) return;
      const touches = e.evt.touches;
      if (touches.length !== 2) return;

      const layer = layers.find((l) => l.id === layerId);
      if (!layer || isLayerLocked(layer)) return;

      e.evt.preventDefault();
      selectLayer(layerId);
      touchGestureRef.current = {
        layerId,
        startDistance: touchDistance(touches[0], touches[1]),
        startAngle: touchAngle(touches[0], touches[1]),
        startScaleX: layer.scaleX,
        startScaleY: layer.scaleY,
        startRotation: layer.rotation,
      };
    },
    [layers, previewMode, readOnly, selectLayer],
  );

  const handleTouchMove = useCallback(
    (layerId: string, e: Konva.KonvaEventObject<TouchEvent>) => {
      const gesture = touchGestureRef.current;
      if (!gesture || gesture.layerId !== layerId) return;

      const touches = e.evt.touches;
      if (touches.length !== 2) return;

      e.evt.preventDefault();
      const dist = touchDistance(touches[0], touches[1]);
      const angle = touchAngle(touches[0], touches[1]);
      const scaleFactor = dist / gesture.startDistance;
      const rotationDelta = angle - gesture.startAngle;

      const node = stageRef.current?.findOne(`#${layerId}`);
      if (node) {
        node.scaleX(gesture.startScaleX * scaleFactor);
        node.scaleY(gesture.startScaleY * scaleFactor);
        node.rotation(gesture.startRotation + rotationDelta);
        node.getLayer()?.batchDraw();
      }
    },
    [],
  );

  const handleTouchEnd = useCallback(() => {
    const gesture = touchGestureRef.current;
    if (gesture) {
      const node = stageRef.current?.findOne(`#${gesture.layerId}`);
      if (node) {
        updateLayer(gesture.layerId, {
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }
    }
    touchGestureRef.current = null;
  }, [updateLayer]);

  const layerHandlers = useMemo(() => {
    const handlers = new Map<string, LayerHandlers>();
    const isInteractive = !readOnly && !previewMode;

    for (const layer of visibleLayers) {
      const locked = isLayerLocked(layer);
      handlers.set(layer.id, {
        onClick: () => isInteractive && selectLayer(layer.id),
        onTap: () => isInteractive && selectLayer(layer.id),
        onDragEnd: (e) => {
          if (locked) return;
          updateLayer(layer.id, { x: e.target.x(), y: e.target.y() });
        },
        onTransformEnd: (e) => {
          if (locked) return;
          const node = e.target;
          updateLayer(layer.id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          });
        },
        onTouchStart: (e) => handleTouchStart(layer.id, e),
        onTouchMove: (e) => handleTouchMove(layer.id, e),
        draggable: isInteractive && !locked,
      });
    }

    return handlers;
  }, [
    visibleLayers,
    readOnly,
    previewMode,
    selectLayer,
    updateLayer,
    handleTouchStart,
    handleTouchMove,
    layerIds,
  ]);

  const bodyFill = isClear ? "rgba(10,10,15,0.85)" : "#0a0a0f";

  const selectedLocked = selectedLayer ? isLayerLocked(selectedLayer) : false;
  const handleSize = mobileTouchMode ? 22 : 14;
  const actionSize = mobileTouchMode ? 40 : 32;
  const selection = useMemo(() => {
    if (!interactive || !selectedLayer || !isLayerVisible(selectedLayer)) return null;
    const frame = selectionLocalFrame(
      selectedLayer,
      width,
      selectedLayer.type === "text" ? textLineWidths : null,
    );
    const toScreen = (canvasX: number, canvasY: number) => ({
      x: stageLeft + view.phoneCrop.x + (canvasX + view.offsetX) * view.scale,
      y: stageTop + view.phoneCrop.y + (canvasY + view.offsetY) * view.scale,
    });
    const at = (localX: number, localY: number) => {
      const point = worldPoint({
        x: selectedLayer.x,
        y: selectedLayer.y,
        rotation: selectedLayer.rotation,
        scaleX: selectedLayer.scaleX,
        scaleY: selectedLayer.scaleY,
        offsetX: frame.offsetX,
        offsetY: frame.offsetY,
        localX,
        localY,
      });
      return toScreen(point.x, point.y);
    };
    return {
      center: at(frame.width / 2, frame.height / 2),
      width: Math.max(1, frame.width * Math.abs(selectedLayer.scaleX) * view.scale),
      height: Math.max(1, frame.height * Math.abs(selectedLayer.scaleY) * view.scale),
      rotation: selectedLayer.rotation,
      corners: [
        at(0, 0),
        at(frame.width, 0),
        at(frame.width, frame.height),
        at(0, frame.height),
      ],
      handles: RESIZE_HANDLES.map((handle) => {
        const nx = handle.includes("right") ? 1 : handle.includes("left") ? 0 : 0.5;
        const ny = handle.includes("bottom") ? 1 : handle.includes("top") ? 0 : 0.5;
        return { handle, ...at(frame.width * nx, frame.height * ny) };
      }),
    };
  }, [interactive, selectedLayer, stageLeft, stageTop, textLineWidths, view, width]);

  const placeControl = (x: number, y: number, size: number) => ({
    x: clamp(x, 0, Math.max(0, layoutWidth - size)),
    y: clamp(y, 0, Math.max(0, layoutHeight - size)),
  });

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto"
      onPointerDown={(event) => {
        if (!interactive) return;
        if (event.target === event.currentTarget) selectLayer(null);
      }}
      style={{ width: layoutWidth, height: layoutHeight, touchAction: "none" }}
    >
      <div
        className="pointer-events-none absolute rounded-[2rem] shadow-2xl"
        style={{
          left: 0,
          top: 0,
          width: layoutWidth,
          height: layoutHeight,
          backgroundColor: isClear ? "rgba(255,255,255,0.06)" : caseColor,
          border: "2px solid rgba(255,255,255,0.12)",
        }}
      />
      <div className="absolute" style={{ left: stageLeft, top: stageTop }}>
        <Stage
          ref={stageRef}
          width={view.stageWidth}
          height={view.stageHeight}
          scaleX={view.scale}
          scaleY={view.scale}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onTouchEnd={handleTouchEnd}
        >
          <Layer>
            <Group x={view.offsetX} y={view.offsetY}>
              {model ? (
                <PhoneBackKonvaLayers
                  model={model}
                  bodyFill={bodyFill}
                  showGuides={false}
                  showCamera={false}
                />
              ) : (
                <Rect
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  fill={bodyFill}
                  cornerRadius={16}
                />
              )}

              <Group clipFunc={designClipFunc}>
                {visibleLayers.map((layer: DesignLayer) => {
                  const commonHandlers = layerHandlers.get(layer.id)!;

                  if (layer.type === "text") {
                    return (
                      <TextLayerNode
                        key={layer.id}
                        layer={layer}
                        canvasWidth={width}
                        handlers={commonHandlers}
                        textureImage={findTextureImage(layers, layer)}
                      />
                    );
                  }

                  return (
                    <DesignImageLayerNode
                      key={layer.id}
                      layer={layer}
                      handlers={commonHandlers}
                    />
                  );
                })}
              </Group>

              {!previewMode && !readOnly && model ? (
                <PhoneBackKonvaLayers
                  model={model}
                  showBody={false}
                  showLogo={false}
                  showCamera={false}
                  showGuides
                />
              ) : null}

              {model ? (
                <PhoneBackKonvaLayers
                  model={model}
                  showBody={false}
                  showLogo={false}
                  showGuides={false}
                  showCamera
                />
              ) : null}

            </Group>
          </Layer>
        </Stage>
      </div>
      {selection && selectedLayer ? (
        <SelectionChrome
          selection={selection}
          locked={selectedLocked}
          handleSize={handleSize}
          actionSize={actionSize}
          layoutWidth={layoutWidth}
          layoutHeight={layoutHeight}
          placeControl={placeControl}
          onLock={() => updateLayer(selectedLayer.id, { locked: !selectedLocked })}
          onDelete={() => setLayerVisible(selectedLayer.id, false)}
          onRotateStart={(event) => {
            if (selectedLocked) return;
            event.preventDefault();
            event.stopPropagation();
            const frame = selectionLocalFrame(selectedLayer, width, textLineWidths);
            const center = worldPoint({
              x: selectedLayer.x,
              y: selectedLayer.y,
              rotation: selectedLayer.rotation,
              scaleX: selectedLayer.scaleX,
              scaleY: selectedLayer.scaleY,
              offsetX: frame.offsetX,
              offsetY: frame.offsetY,
              localX: frame.width / 2,
              localY: frame.height / 2,
            });
            const point = clientToCanvas(event.clientX, event.clientY);
            chromeMovedRef.current = false;
            chromeGestureRef.current = {
              kind: "rotate",
              startAngle:
                (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI,
              startRotation: selectedLayer.rotation,
              centerX: center.x,
              centerY: center.y,
              vx: (frame.width / 2 - frame.offsetX) * selectedLayer.scaleX,
              vy: (frame.height / 2 - frame.offsetY) * selectedLayer.scaleY,
            };
          }}
          onResizeStart={(handle, event) => {
            if (selectedLocked) return;
            event.preventDefault();
            event.stopPropagation();
            chromeMovedRef.current = false;
            chromeGestureRef.current = { kind: "resize", handle };
          }}
        />
      ) : null}
    </div>
  );
}

function SelectionChrome({
  selection,
  locked,
  handleSize,
  actionSize,
  layoutWidth,
  layoutHeight,
  placeControl,
  onLock,
  onDelete,
  onRotateStart,
  onResizeStart,
}: {
  selection: {
    center: { x: number; y: number };
    width: number;
    height: number;
    rotation: number;
    corners: Array<{ x: number; y: number }>;
    handles: Array<{ handle: ResizeHandle; x: number; y: number }>;
  };
  locked: boolean;
  handleSize: number;
  actionSize: number;
  layoutWidth: number;
  layoutHeight: number;
  placeControl: (x: number, y: number, size: number) => { x: number; y: number };
  onLock: () => void;
  onDelete: () => void;
  onRotateStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onResizeStart: (handle: ResizeHandle, event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const anchorFill = locked ? "#94a3b8" : "#ffffff";
  const anchorStroke = locked ? "#64748b" : "#06b6d4";
  const rowWidth = actionSize * 3 + ACTION_GAP * 2;
  const minX = Math.min(...selection.corners.map((corner) => corner.x));
  const maxX = Math.max(...selection.corners.map((corner) => corner.x));
  const minY = Math.min(...selection.corners.map((corner) => corner.y));
  const row = {
    x: clamp((minX + maxX) / 2 - rowWidth / 2, 0, Math.max(0, layoutWidth - rowWidth)),
    y: clamp(minY - ACTION_GAP - actionSize, 0, Math.max(0, layoutHeight - actionSize)),
  };
  const actions: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
    onClick?: () => void;
  }> = [
    {
      key: "rotate",
      label: "چرخاندن",
      icon: <RotateCw size={16} />,
      onPointerDown: onRotateStart,
    },
    {
      key: "lock",
      label: locked ? "باز کردن قفل لایه" : "قفل کردن لایه",
      icon: locked ? <Lock size={16} /> : <LockOpen size={16} />,
      onClick: onLock,
    },
    {
      key: "delete",
      label: "حذف",
      icon: <Trash2 size={16} />,
      onClick: onDelete,
    },
  ];

  return (
    <>
      <div
        className="pointer-events-none absolute z-10 border-2 border-cyan-400"
        style={{
          left: selection.center.x,
          top: selection.center.y,
          width: selection.width,
          height: selection.height,
          transform: `translate(-50%, -50%) rotate(${selection.rotation}deg)`,
        }}
      />
      {selection.handles.map((handle) => {
        const pos = placeControl(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize);
        return (
          <button
            key={handle.handle}
            type="button"
            aria-label="تغییر اندازه"
            onPointerDown={(event) => onResizeStart(handle.handle, event)}
            className="absolute z-20 rounded-sm border-2"
            style={{
              left: pos.x,
              top: pos.y,
              width: handleSize,
              height: handleSize,
              backgroundColor: anchorFill,
              borderColor: anchorStroke,
              touchAction: "none",
            }}
          />
        );
      })}
      {actions.map((action, index) => (
        <button
          key={action.key}
          type="button"
          aria-label={action.label}
          title={action.label}
          aria-pressed={action.key === "lock" ? locked : undefined}
          onPointerDown={(event) => {
            event.stopPropagation();
            action.onPointerDown?.(event);
          }}
          onClick={(event) => {
            event.stopPropagation();
            action.onClick?.();
          }}
          className={`absolute z-30 flex items-center justify-center rounded-full border shadow-lg ${
            locked && action.key === "lock"
              ? "border-amber-300 bg-amber-400 text-black"
              : "border-cyan-300 bg-white text-slate-900"
          }`}
          style={{
            left: row.x + index * (actionSize + ACTION_GAP),
            top: row.y,
            width: actionSize,
            height: actionSize,
            touchAction: "none",
          }}
        >
          {action.icon}
        </button>
      ))}
    </>
  );
}

export default memo(CaseCanvas);

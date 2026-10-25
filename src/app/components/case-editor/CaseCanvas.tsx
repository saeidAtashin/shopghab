"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { Lock, LockOpen, RotateCw } from "lucide-react";
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
  clampRectInside,
  fitSelectionView,
  layerSelectionRect,
  resizeFromHandle,
  selectionLocalFrame,
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
const FRAME_MARGIN = 8;
const LOCK_BUTTON = 44;
const RESIZE_HANDLES: ResizeHandle[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "middle-left",
  "middle-right",
];

type ChromeGesture =
  | {
      kind: "rotate";
      startAngle: number;
      startRotation: number;
      centerX: number;
      centerY: number;
    }
  | { kind: "resize"; handle: ResizeHandle };

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
  const commitHistory = useEditorStore((s) => s.commitHistory);

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
          { rotation: gesture.startRotation + (angle - gesture.startAngle) },
          { recordHistory: false },
        );
        return;
      }
      const frame = selectionLocalFrame(layer, canvasWidthRef.current);
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
    if (e.target === e.target.getStage()) {
      selectLayer(null);
    }
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
  const rotateGap = mobileTouchMode ? 36 : 28;
  const selectionFrame = useMemo(() => {
    if (!interactive || !selectedLayer || !isLayerVisible(selectedLayer)) return null;
    const box = layerSelectionRect(selectedLayer, width);
    const screen = {
      x: stageLeft + view.phoneCrop.x + (box.x + view.offsetX) * view.scale,
      y: stageTop + view.phoneCrop.y + (box.y + view.offsetY) * view.scale,
      width: box.width * view.scale,
      height: box.height * view.scale,
    };
    return clampRectInside(screen, {
      x: CHROME_PAD + FRAME_MARGIN,
      y: CHROME_PAD + FRAME_MARGIN,
      width: Math.max(1, view.phoneCrop.width - FRAME_MARGIN * 2),
      height: Math.max(1, view.phoneCrop.height - FRAME_MARGIN * 2),
    });
  }, [interactive, selectedLayer, stageLeft, stageTop, view, width]);

  const placeControl = (x: number, y: number, size: number) => ({
    x: clamp(x, 0, Math.max(0, layoutWidth - size)),
    y: clamp(y, 0, Math.max(0, layoutHeight - size)),
  });

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto"
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
      {selectionFrame && selectedLayer ? (
        <SelectionChrome
          frame={selectionFrame}
          locked={selectedLocked}
          handleSize={handleSize}
          rotateGap={rotateGap}
          placeControl={placeControl}
          onLock={() => updateLayer(selectedLayer.id, { locked: !selectedLocked })}
          onRotateStart={(event) => {
            if (selectedLocked) return;
            event.preventDefault();
            event.stopPropagation();
            const box = layerSelectionRect(selectedLayer, width);
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const point = clientToCanvas(event.clientX, event.clientY);
            chromeMovedRef.current = false;
            chromeGestureRef.current = {
              kind: "rotate",
              startAngle:
                (Math.atan2(point.y - centerY, point.x - centerX) * 180) / Math.PI,
              startRotation: selectedLayer.rotation,
              centerX,
              centerY,
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
  frame,
  locked,
  handleSize,
  rotateGap,
  placeControl,
  onLock,
  onRotateStart,
  onResizeStart,
}: {
  frame: { x: number; y: number; width: number; height: number };
  locked: boolean;
  handleSize: number;
  rotateGap: number;
  placeControl: (x: number, y: number, size: number) => { x: number; y: number };
  onLock: () => void;
  onRotateStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onResizeStart: (handle: ResizeHandle, event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const rotateSize = handleSize + 10;
  const rotate = placeControl(
    frame.x + frame.width / 2 - rotateSize / 2,
    frame.y - rotateGap - rotateSize,
    rotateSize,
  );
  const lock = placeControl(
    frame.x + frame.width - LOCK_BUTTON,
    frame.y - LOCK_BUTTON - 6,
    LOCK_BUTTON,
  );
  const anchorFill = locked ? "#94a3b8" : "#ffffff";
  const anchorStroke = locked ? "#64748b" : "#06b6d4";

  return (
    <>
      <div
        className="pointer-events-none absolute z-10 border-2 border-cyan-400"
        style={{
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
        }}
      />
      {RESIZE_HANDLES.map((handle) => {
        const nx = handle.includes("right") ? 1 : handle.includes("left") ? 0 : 0.5;
        const ny = handle.startsWith("bottom") ? 1 : handle.startsWith("top") ? 0 : 0.5;
        const pos = placeControl(
          frame.x + frame.width * nx - handleSize / 2,
          frame.y + frame.height * ny - handleSize / 2,
          handleSize,
        );
        return (
          <button
            key={handle}
            type="button"
            aria-label="تغییر اندازه"
            onPointerDown={(event) => onResizeStart(handle, event)}
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
      <button
        type="button"
        aria-label="چرخاندن"
        onPointerDown={onRotateStart}
        className="absolute z-20 flex items-center justify-center rounded-full border-2"
        style={{
          left: rotate.x,
          top: rotate.y,
          width: rotateSize,
          height: rotateSize,
          backgroundColor: anchorFill,
          borderColor: anchorStroke,
          touchAction: "none",
        }}
      >
        <RotateCw size={12} color={anchorStroke} />
      </button>
      <button
        type="button"
        aria-pressed={locked}
        aria-label={locked ? "باز کردن قفل لایه" : "قفل کردن لایه"}
        title={locked ? "باز کردن قفل" : "قفل"}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onLock();
        }}
        className={`absolute z-30 flex items-center justify-center rounded-full border shadow-lg ${
          locked
            ? "border-amber-300 bg-amber-400 text-black"
            : "border-cyan-300 bg-white text-slate-900"
        }`}
        style={{ left: lock.x, top: lock.y, width: LOCK_BUTTON, height: LOCK_BUTTON }}
      >
        {locked ? <Lock size={18} /> : <LockOpen size={18} />}
      </button>
    </>
  );
}

export default memo(CaseCanvas);

"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Transformer, Group, Rect } from "react-konva";
import { Lock, LockOpen } from "lucide-react";
import type Konva from "konva";

import { PhoneBackKonvaLayers } from "@/app/components/case-wizard/PhoneBackKonva";
import {
  createCaseDesignClipFunc,
  createFallbackCaseDesignClipFunc,
  mapGeometryToCanvas,
} from "@/lib/cases/phone-back";
import { useEditorStore } from "@/lib/design/editor-store";
import { STAGE_EXPORT_CROP_ATTR } from "@/lib/design/export";
import { fitSelectionView, layerSelectionRect } from "@/lib/design/selection-view";
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
const LOCK_BUTTON = 44;

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
  const transformerRef = useRef<Konva.Transformer>(null);
  const touchGestureRef = useRef<TouchGesture | null>(null);
  const [lockAnchor, setLockAnchor] = useState<{ x: number; y: number } | null>(null);

  const layers = useEditorStore((s) => s.document.layers);
  const canvasWidth = useEditorStore((s) => s.document.canvas.width);
  const canvasHeight = useEditorStore((s) => s.document.canvas.height);
  const meta = useEditorStore((s) => s.meta);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const previewMode = useEditorStore((s) => s.previewMode);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);

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
    layerBox:
      interactive && selectedLayer && isLayerVisible(selectedLayer)
        ? layerSelectionRect(selectedLayer, width)
        : null,
    handleScreenPx: mobileTouchMode ? 72 : 48,
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

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (stage) stage.setAttr(STAGE_EXPORT_CROP_ATTR, view.phoneCrop);
    if (!transformer || !stage || !interactive) {
      transformer?.nodes([]);
      setLockAnchor(null);
      return;
    }

    const layer = selectedLayer && isLayerVisible(selectedLayer) ? selectedLayer : null;
    const selected = layer ? stage.findOne(`#${layer.id}`) : null;
    if (!selected || !layer) {
      transformer.nodes([]);
      setLockAnchor(null);
      return;
    }

    transformer.nodes([selected]);
    transformer.getLayer()?.batchDraw();

    const box = transformer.getClientRect();
    if (box.width < 1 || box.height < 1) {
      setLockAnchor(null);
      return;
    }
    const rawX = box.x + box.width - LOCK_BUTTON;
    const rawY = box.y - LOCK_BUTTON - 6;
    const x = clamp(rawX, 0, Math.max(0, stage.width() - LOCK_BUTTON));
    const y = clamp(rawY, 0, Math.max(0, stage.height() - LOCK_BUTTON));
    setLockAnchor((prev) =>
      prev && Math.abs(prev.x - x) < 0.5 && Math.abs(prev.y - y) < 0.5 ? prev : { x, y },
    );
  }, [interactive, layers, selectedLayer, view.phoneCrop, view.scale, view.offsetX, view.offsetY]);

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

  return (
    <div
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

              {interactive ? (
                <Transformer
                  ref={transformerRef}
                  name="selection-transformer"
                  padding={mobileTouchMode ? 12 : 8}
                  anchorSize={mobileTouchMode ? 22 : 14}
                  borderStroke="#22d3ee"
                  borderStrokeWidth={mobileTouchMode ? 2.5 : 1.5}
                  anchorStroke={selectedLocked ? "#64748b" : "#06b6d4"}
                  anchorFill={selectedLocked ? "#94a3b8" : "#ffffff"}
                  rotateAnchorOffset={mobileTouchMode ? 36 : 28}
                  listening={!selectedLocked}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) return oldBox;
                    return newBox;
                  }}
                  rotateEnabled
                  resizeEnabled
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "middle-left",
                    "middle-right",
                  ]}
                />
              ) : null}
            </Group>
          </Layer>
        </Stage>
      </div>
      {interactive && lockAnchor && selectedLayer ? (
        <button
          type="button"
          aria-pressed={selectedLocked}
          aria-label={selectedLocked ? "باز کردن قفل لایه" : "قفل کردن لایه"}
          title={selectedLocked ? "باز کردن قفل" : "قفل"}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            updateLayer(selectedLayer.id, { locked: !selectedLocked });
          }}
          className={`absolute z-10 flex items-center justify-center rounded-full border shadow-lg ${
            selectedLocked
              ? "border-amber-300 bg-amber-400 text-black"
              : "border-cyan-300 bg-white text-slate-900"
          }`}
          style={{
            left: stageLeft + lockAnchor.x,
            top: stageTop + lockAnchor.y,
            width: LOCK_BUTTON,
            height: LOCK_BUTTON,
          }}
        >
          {selectedLocked ? <Lock size={18} /> : <LockOpen size={18} />}
        </button>
      ) : null}
    </div>
  );
}

export default memo(CaseCanvas);

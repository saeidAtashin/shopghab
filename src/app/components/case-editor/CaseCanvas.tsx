"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Stage, Layer, Transformer, Group, Rect } from "react-konva";
import type Konva from "konva";

import { PhoneBackKonvaLayers } from "@/app/components/case-wizard/PhoneBackKonva";
import {
  createCaseDesignClipFunc,
  createFallbackCaseDesignClipFunc,
  mapGeometryToCanvas,
} from "@/lib/cases/phone-back";
import { useEditorStore } from "@/lib/design/editor-store";
import { isLayerVisible, type DesignLayer } from "@/lib/design/types";
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
  const scale = Math.min(maxW / width, maxH / height);
  const isClear = caseMaterial === "clear";
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

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage || readOnly || previewMode) {
      transformer?.nodes([]);
      return;
    }

    const selected = selectedLayerId ? stage.findOne(`#${selectedLayerId}`) : null;
    if (selected && selectedLayerId) {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (layer && isLayerVisible(layer)) {
        transformer.nodes([selected]);
        transformer.getLayer()?.batchDraw();
      } else {
        transformer.nodes([]);
      }
    } else {
      transformer.nodes([]);
    }
  }, [selectedLayerId, layers, readOnly, previewMode]);

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
      if (!layer) return;

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
      handlers.set(layer.id, {
        onClick: () => isInteractive && selectLayer(layer.id),
        onTap: () => isInteractive && selectLayer(layer.id),
        onDragEnd: (e) => {
          updateLayer(layer.id, { x: e.target.x(), y: e.target.y() });
        },
        onTransformEnd: (e) => {
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
        draggable: isInteractive,
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

  return (
    <div
      className="mx-auto rounded-[2rem] p-3 shadow-2xl"
      style={{
        backgroundColor: isClear ? "rgba(255,255,255,0.06)" : caseColor,
        border: "2px solid rgba(255,255,255,0.12)",
        touchAction: "none",
      }}
    >
      <Stage
        ref={stageRef}
        width={width * scale}
        height={height * scale}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onTouchEnd={handleTouchEnd}
      >
        <Layer>
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

          {!readOnly && !previewMode ? (
            <Transformer
              ref={transformerRef}
              padding={mobileTouchMode ? 10 : 8}
              anchorSize={mobileTouchMode ? 12 : 8}
              borderStrokeWidth={mobileTouchMode ? 2 : 1}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 10 || newBox.height < 10) return oldBox;
                return newBox;
              }}
              rotateEnabled
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
        </Layer>
      </Stage>
    </div>
  );
}

export default memo(CaseCanvas);

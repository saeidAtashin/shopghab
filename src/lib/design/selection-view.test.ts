import assert from "node:assert/strict";
import test from "node:test";

import { fitSelectionView, transformedAabb } from "./selection-view";
import { lockImageLayers, type DesignLayer } from "./types";

test("a rotated box keeps every corner inside the axis-aligned frame", () => {
  const box = transformedAabb({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    scaleX: 1,
    scaleY: 1,
    rotation: 90,
  });

  assert.ok(Math.abs(box.x - -10) < 0.001);
  assert.ok(Math.abs(box.y) < 0.001);
  assert.ok(Math.abs(box.width - 10) < 0.001);
  assert.ok(Math.abs(box.height - 10) < 0.001);
});

test("the phone fills the stage until a layer is selected", () => {
  const view = fitSelectionView({
    canvasWidth: 280,
    canvasHeight: 560,
    maxWidth: 280,
    maxHeight: 560,
    layerBox: null,
    handleScreenPx: 48,
  });

  assert.equal(view.scale, 1);
  assert.equal(view.offsetX, 0);
  assert.equal(view.offsetY, 0);
  assert.equal(view.phoneCrop.x, 0);
  assert.equal(view.phoneCrop.pixelRatioBoost, 1);
  assert.equal(view.stageWidth, 280);
  assert.equal(view.stageHeight, 560);
});

test("an oversized layer keeps the phone at full size and grows the stage around it", () => {
  const idle = fitSelectionView({
    canvasWidth: 280,
    canvasHeight: 560,
    maxWidth: 280,
    maxHeight: 560,
    layerBox: null,
    handleScreenPx: 48,
  });
  const view = fitSelectionView({
    canvasWidth: 280,
    canvasHeight: 560,
    maxWidth: 280,
    maxHeight: 560,
    layerBox: { x: -400, y: 0, width: 1080, height: 560 },
    handleScreenPx: 48,
  });

  assert.equal(view.scale, idle.scale);
  assert.equal(view.phoneCrop.pixelRatioBoost, 1);
  assert.equal(view.phoneCrop.width, idle.phoneCrop.width);
  assert.equal(view.phoneCrop.height, idle.phoneCrop.height);
  assert.ok(view.stageWidth > view.phoneCrop.width);
  assert.ok(view.phoneCrop.x > 0);
  assert.ok(view.phoneCrop.x + view.phoneCrop.width <= view.stageWidth + 0.5);
});

test("ready-made image layers lock and other layers stay as they were", () => {
  const layers: DesignLayer[] = [
    {
      id: "image",
      type: "image",
      src: "/a.webp",
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
    {
      id: "text",
      type: "text",
      text: "سلام",
      fontFamily: "CaseEditorVazirmatn",
      fontSize: 28,
      fill: "#fff",
      align: "center",
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
  ];

  const locked = lockImageLayers(layers);
  assert.equal(locked[0]?.locked, true);
  assert.equal(locked[1]?.locked, undefined);
  assert.notEqual(locked[0], layers[0]);
});

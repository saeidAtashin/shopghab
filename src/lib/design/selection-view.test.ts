import assert from "node:assert/strict";
import test from "node:test";

import { clampRectInside, fitSelectionView, resizeFromHandle, transformedAabb } from "./selection-view";
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

test("the phone fills the stage", () => {
  const view = fitSelectionView({
    canvasWidth: 280,
    canvasHeight: 560,
    maxWidth: 280,
    maxHeight: 560,
  });

  assert.equal(view.scale, 1);
  assert.equal(view.offsetX, 0);
  assert.equal(view.offsetY, 0);
  assert.equal(view.phoneCrop.x, 0);
  assert.equal(view.phoneCrop.pixelRatioBoost, 1);
  assert.equal(view.stageWidth, 280);
  assert.equal(view.stageHeight, 560);
});

test("an oversized layer box is clipped inside the phone", () => {
  const visible = clampRectInside(
    { x: -400, y: 0, width: 1080, height: 560 },
    { x: 8, y: 8, width: 264, height: 544 },
  );

  assert.equal(visible.x, 8);
  assert.equal(visible.y, 8);
  assert.equal(visible.width, 264);
  assert.equal(visible.height, 544);
});

test("resizing from a corner keeps the opposite corner fixed", () => {
  const next = resizeFromHandle({
    handle: "bottom-right",
    pointerX: 200,
    pointerY: 100,
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    width: 100,
    height: 50,
    offsetX: 0,
    offsetY: 0,
  });

  assert.equal(next.x, 0);
  assert.equal(next.y, 0);
  assert.equal(next.scaleX, 2);
  assert.equal(next.scaleY, 2);
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

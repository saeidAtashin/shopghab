export type Point = { x: number; y: number };

export type FillStrategy =
  | { strategy: "solid"; color: string }
  | { strategy: "edge-extend" }
  | { strategy: "blur"; sigma?: number };

export type MockupRenderer = "prepared" | "photoshop";

export type OverlayBlend = "normal" | "screen" | "multiply" | "linear-burn" | "color-burn" | "soft-light" | "color-dodge";

export type MockupOverlay = {
  path: string;
  blend: OverlayBlend;
};

export type PrintableMesh = {
  columns: number;
  rows: number;
  /** Row-major grid in smart-object pixels. Quilt meshes store Bezier controls. */
  points: Point[];
  /** Quilt divisions in smart-object pixels, including both ends. */
  slicesX?: number[];
  slicesY?: number[];
};

export type PrintableRegion = {
  width: number;
  height: number;
  origin?: Point;
  quad?: [Point, Point, Point, Point];
  mesh?: PrintableMesh;
  smartObjectName?: string;
};

export type MockupTemplateConfig = {
  id: string;
  name: string;
  psdPath: string;
  enabled: boolean;
  renderer: MockupRenderer;
  version: string;
  default: boolean;
  output: { width: number; height: number; quality: number; thumbEdge: number };
  printable: PrintableRegion;
  maskPath: string | null;
  basePath: string | null;
  shadePath: string | null;
  highlightPath: string | null;
  /** Layers above the Print smart object, bottom to top. */
  overlays?: MockupOverlay[];
  displacementPath: string | null;
  displacementScale: number;
  fit: "contain" | "cover";
  /** Flat colored cards stay out of the three listing photos. */
  listing: boolean;
  fill: FillStrategy;
  cornerRadius: number;
};

export type MockupStatus = "ready" | "error" | "skipped";

export type MockupRecord = {
  templateId: string;
  path: string;
  thumbPath: string;
  width: number;
  height: number;
  contentHash: string;
  templateVersion: string;
  generatedAt: string;
 
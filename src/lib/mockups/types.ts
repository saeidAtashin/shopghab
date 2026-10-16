export type Point = { x: number; y: number };

export type FillStrategy =
  | { strategy: "solid"; color: string }
  | { strategy: "edge-extend" }
  | { strategy: "blur"; sigma?: number };

export type MockupRenderer = "prepared" | "photoshop";

export type PrintableRegion = {
  width: number;
  height: number;
  origin?: Point;
  quad?: [Point, Point, Point, Point];
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
  displacementPath: string | null;
  displacementScale: number;
  fit: "contain";
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
  status: MockupStatus;
  error: string;
};

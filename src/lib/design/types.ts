export type DesignLayerBase = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  /** Default true; false = soft-deleted/hidden on canvas */
  visible?: boolean;
  /** Optional label for layers panel */
  name?: string;
};

export type TextLayer = DesignLayerBase & {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  align: "left" | "center" | "right";
  /** Text box width for Konva alignment */
  width?: number;
  /** Background fill behind text; null/undefined = transparent */
  backgroundFill?: string | null;
  /** Corner radius for text background box (0–24) */
  cornerRadius?: number;
  /** Inner padding for text background box */
  padding?: number;
};

export type ImageBlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten";

export type ImageEffectType =
  | "grayscale"
  | "blur"
  | "brighten"
  | "contrast"
  | "sepia";

export type ImageLayerEffect = {
  id: string;
  type: ImageEffectType;
  /** 0–100, default 50; used for blur / brighten / contrast */
  intensity?: number;
};

export type PendingEffectPreview = {
  layerId: string;
  type: ImageEffectType;
  intensity: number;
};

export type ImageLayer = DesignLayerBase & {
  type: "image";
  src: string;
  width: number;
  height: number;
  isSticker?: boolean;
  /** 0–1, default 1 */
  opacity?: number;
  blendMode?: ImageBlendMode;
  effects?: ImageLayerEffect[];
  /** @deprecated — migrated on read via getImageLayerEffects */
  effect?: "none" | ImageEffectType;
  /** @deprecated — migrated on read via getImageLayerEffects */
  effectIntensity?: number;
};

export type DesignLayer = TextLayer | ImageLayer;

export type DesignDocument = {
  id?: string;
  shareToken?: string;
  name?: string;
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  description?: string;
  layers: DesignLayer[];
  canvas: { width: number; height: number };
  previewUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedDesign = DesignDocument & {
  id: string;
  shareToken: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export function createEmptyDesign(input: {
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  canvasWidth: number;
  canvasHeight: number;
}): DesignDocument {
  return {
    brandSlug: input.brandSlug,
    modelSlug: input.modelSlug,
    caseTypeSlug: input.caseTypeSlug,
    layers: [],
    canvas: { width: input.canvasWidth, height: input.canvasHeight },
    description: "",
  };
}

export function generateLayerId(): string {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateEffectId(): string {
  return `effect-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateShareToken(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const DEFAULT_REFERENCE_CANVAS = { width: 280, height: 560 } as const;

export type CaseTemplate = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  /** Top-level folder slug from designed-source (e.g. abstract, islamic). */
  category?: string;
  /** Filename-derived subcategory (e.g. seamless, modern, others). */
  subcategory?: string;
  referenceCanvas: { width: number; height: number };
  layers: DesignLayer[];
};

export function isLayerVisible(layer: DesignLayer): boolean {
  return layer.visible !== false;
}

export function cloneLayersWithNewIds(layers: DesignLayer[]): DesignLayer[] {
  return layers.map((layer) => ({
    ...structuredClone(layer),
    id: generateLayerId(),
    visible: layer.visible !== false,
  }));
}

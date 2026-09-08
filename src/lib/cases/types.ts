import type { DesignLayer } from "@/lib/design/types";

export type PhoneBrand = {
  slug: string;
  name: string;
  nameEn: string;
  logo: string;
};

export type PhoneSeries = {
  slug: string;
  name: string;
  nameEn: string;
  sortOrder: number;
};

export type MmRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius?: number;
};

export type MmCircle = {
  cx: number;
  cy: number;
  r: number;
};

export type PhoneBackGeometry = {
  cornerRadiusMm: number;
  camera: {
    module: MmRect;
    lenses: MmCircle[];
    flash?: MmRect;
    lidar?: MmCircle;
  };
  logo?: MmCircle;
  printSafeInsetMm: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  chassisTemplate: string;
};

export type PhoneModel = {
  slug: string;
  brandSlug: string;
  seriesSlug: string;
  name: string;
  nameEn: string;
  image: string;
  canvasWidth: number;
  canvasHeight: number;
  widthMm: number;
  heightMm: number;
  back?: PhoneBackGeometry;
};

export type CaseType = {
  slug: string;
  name: string;
  description: string;
  price: number;
  customizationFee: number;
  color: string;
  material: "clear" | "matte" | "glass" | "silicone" | "leather";
};

export type ReadyCase = {
  id: string;
  slug: string;
  title: string;
  description: string;
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  tags: string[];
  inStock: boolean;
  template?: { layers: DesignLayer[] };
};

export type StickerPack = {
  id: string;
  category: string;
  name: string;
  stickers: StickerItem[];
};

export type StickerItem = {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
};

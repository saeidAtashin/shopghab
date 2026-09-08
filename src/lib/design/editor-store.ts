"use client";

import { create } from "zustand";

import type { CaseType, PhoneModel } from "@/lib/cases/types";
import {
  DEFAULT_EDITOR_FONT,
  getDefaultTextBoxWidth,
} from "./editor-fonts";
import {
  cloneLayersWithNewIds,
  createEmptyDesign,
  generateLayerId,
  type CaseTemplate,
  type DesignDocument,
  type DesignLayer,
  type ImageLayer,
  type PendingEffectPreview,
  type TextLayer,
} from "./types";
import { resolveReferenceCanvas, scaleLayersToCanvas } from "./template-scale";

const MAX_HISTORY = 20;

type EditorMeta = {
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  caseType: CaseType;
  model: PhoneModel;
  canvasWidth: number;
  canvasHeight: number;
};

type EditorState = {
  document: DesignDocument;
  meta: EditorMeta | null;
  selectedLayerId: string | null;
  previewMode: boolean;
  pendingEffectPreview: PendingEffectPreview | null;
  history: DesignDocument[];
  historyIndex: number;
  uploadedAssets: string[];
  init: (meta: EditorMeta) => void;
  loadDocument: (doc: DesignDocument, meta: EditorMeta) => void;
  setDescription: (description: string) => void;
  setName: (name: string) => void;
  selectLayer: (id: string | null) => void;
  setPreviewMode: (preview: boolean) => void;
  setPendingEffectPreview: (preview: PendingEffectPreview | null) => void;
  addTextLayer: (text?: string) => void;
  addImageLayer: (src: string, width: number, height: number, isSticker?: boolean, name?: string) => void;
  updateLayer: (
    id: string,
    patch: Partial<DesignLayer>,
    options?: { recordHistory?: boolean },
  ) => void;
  commitHistory: () => void;
  removeLayer: (id: string) => void;
  setLayerVisible: (id: string, visible: boolean) => void;
  restoreLayer: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  moveLayerToIndex: (id: string, index: number) => void;
  duplicateLayer: (id: string) => void;
  nudgeLayer: (id: string, dx: number, dy: number) => void;
  loadTemplate: (template: CaseTemplate, replace?: boolean) => void;
  trackUploadedAsset: (src: string) => void;
  undo: () => void;
  redo: () => void;
  getSelectedLayer: () => DesignLayer | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

function pushHistory(state: EditorState, nextDoc: DesignDocument): Partial<EditorState> {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  const nextHistory = [...trimmed, structuredClone(nextDoc)].slice(-MAX_HISTORY);
  return {
    document: nextDoc,
    history: nextHistory,
    historyIndex: nextHistory.length - 1,
  };
}

function updateDoc(state: EditorState, updater: (doc: DesignDocument) => DesignDocument) {
  const nextDoc = updater(structuredClone(state.document));
  return pushHistory(state, nextDoc);
}

function patchDoc(state: EditorState, updater: (doc: DesignDocument) => DesignDocument) {
  return { document: updater(structuredClone(state.document)) };
}

function countTextLayers(layers: DesignLayer[]): number {
  return layers.filter((l) => l.type === "text").length;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: createEmptyDesign({
    brandSlug: "",
    modelSlug: "",
    caseTypeSlug: "",
    canvasWidth: 280,
    canvasHeight: 560,
  }),
  meta: null,
  selectedLayerId: null,
  previewMode: false,
  pendingEffectPreview: null,
  history: [],
  historyIndex: -1,
  uploadedAssets: [],

  init: (meta) => {
    const doc = createEmptyDesign({
      brandSlug: meta.brandSlug,
      modelSlug: meta.modelSlug,
      caseTypeSlug: meta.caseTypeSlug,
      canvasWidth: meta.canvasWidth,
      canvasHeight: meta.canvasHeight,
    });
    set({
      meta,
      document: doc,
      selectedLayerId: null,
      previewMode: false,
      pendingEffectPreview: null,
      uploadedAssets: [],
      history: [structuredClone(doc)],
      historyIndex: 0,
    });
  },

  loadDocument: (doc, meta) => {
    const uploadedAssets = doc.layers
      .filter((l): l is ImageLayer => l.type === "image" && !l.isSticker)
      .map((l) => l.src);
    set({
      meta,
      document: structuredClone(doc),
      selectedLayerId: null,
      previewMode: false,
      pendingEffectPreview: null,
      uploadedAssets: [...new Set(uploadedAssets)],
      history: [structuredClone(doc)],
      historyIndex: 0,
    });
  },

  setDescription: (description) => {
    set((state) => updateDoc(state, (doc) => ({ ...doc, description })));
  },

  setName: (name) => {
    set((state) => updateDoc(state, (doc) => ({ ...doc, name })));
  },

  selectLayer: (id) => {
    if (id) {
      const layer = get().document.layers.find((l) => l.id === id);
      if (layer && layer.visible === false) {
        get().setLayerVisible(id, true);
      }
    }
    const preview = get().pendingEffectPreview;
    const clearPreview = !id || preview?.layerId !== id;
    set({
      selectedLayerId: id,
      pendingEffectPreview: clearPreview ? null : preview,
    });
  },

  setPreviewMode: (preview) =>
    set({
      previewMode: preview,
      selectedLayerId: preview ? null : get().selectedLayerId,
      pendingEffectPreview: preview ? null : get().pendingEffectPreview,
    }),

  setPendingEffectPreview: (preview) => set({ pendingEffectPreview: preview }),

  addTextLayer: (text = "متن شما") => {
    const { meta, document } = get();
    if (!meta) return;
    const textCount = countTextLayers(document.layers) + 1;
    const boxWidth = getDefaultTextBoxWidth(meta.canvasWidth);
    const layer: TextLayer = {
      id: generateLayerId(),
      type: "text",
      text,
      fontFamily: DEFAULT_EDITOR_FONT,
      fontSize: 28,
      fill: "#ffffff",
      align: "center",
      width: boxWidth,
      backgroundFill: null,
      cornerRadius: 0,
      padding: 8,
      name: `متن ${textCount}`,
      visible: true,
      x: meta.canvasWidth / 2,
      y: meta.canvasHeight / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    set((state) => {
      const next = updateDoc(state, (doc) => ({
        ...doc,
        layers: [...doc.layers, layer],
      }));
      return { ...next, selectedLayerId: layer.id };
    });
  },

  addImageLayer: (src, width, height, isSticker = false, name) => {
    const { meta, document } = get();
    if (!meta) return;
    const imageCount = document.layers.filter((l) => l.type === "image").length + 1;
    const layer: ImageLayer = {
      id: generateLayerId(),
      type: "image",
      src,
      width,
      height,
      isSticker,
      name: name ?? (isSticker ? `استیکر ${imageCount}` : `تصویر ${imageCount}`),
      visible: true,
      x: meta.canvasWidth / 2 - width / 2,
      y: meta.canvasHeight / 2 - height / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    set((state) => {
      const next = updateDoc(state, (doc) => ({
        ...doc,
        layers: [...doc.layers, layer],
      }));
      const assets = isSticker ? state.uploadedAssets : [...new Set([...state.uploadedAssets, src])];
      return { ...next, selectedLayerId: layer.id, uploadedAssets: assets };
    });
  },

  updateLayer: (id, patch, options) => {
    const recordHistory = options?.recordHistory !== false;
    set((state) => {
      const updater = (doc: DesignDocument) => ({
        ...doc,
        layers: doc.layers.map((layer) =>
          layer.id === id ? ({ ...layer, ...patch } as DesignLayer) : layer,
        ),
      });
      return recordHistory ? updateDoc(state, updater) : patchDoc(state, updater);
    });
  },

  commitHistory: () => {
    set((state) => pushHistory(state, structuredClone(state.document)));
  },

  removeLayer: (id) => {
    set((state) => {
      const next = updateDoc(state, (doc) => ({
        ...doc,
        layers: doc.layers.filter((l) => l.id !== id),
      }));
      return {
        ...next,
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
      };
    });
  },

  setLayerVisible: (id, visible) => {
    set((state) => {
      const next = updateDoc(state, (doc) => ({
        ...doc,
        layers: doc.layers.map((layer) =>
          layer.id === id ? ({ ...layer, visible } as DesignLayer) : layer,
        ),
      }));
      return {
        ...next,
        selectedLayerId:
          !visible && state.selectedLayerId === id ? null : state.selectedLayerId,
      };
    });
  },

  restoreLayer: (id) => {
    get().setLayerVisible(id, true);
    set({ selectedLayerId: id });
  },

  moveLayer: (id, direction) => {
    set((state) =>
      updateDoc(state, (doc) => {
        const idx = doc.layers.findIndex((l) => l.id === id);
        if (idx === -1) return doc;
        const next = [...doc.layers];
        const swapIdx = direction === "up" ? idx + 1 : idx - 1;
        if (swapIdx < 0 || swapIdx >= next.length) return doc;
        [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
        return { ...doc, layers: next };
      }),
    );
  },

  moveLayerToIndex: (id, index) => {
    set((state) =>
      updateDoc(state, (doc) => {
        const idx = doc.layers.findIndex((l) => l.id === id);
        if (idx === -1) return doc;
        const next = [...doc.layers];
        const [item] = next.splice(idx, 1);
        const clamped = Math.max(0, Math.min(index, next.length));
        next.splice(clamped, 0, item);
        return { ...doc, layers: next };
      }),
    );
  },

  duplicateLayer: (id) => {
    const layer = get().document.layers.find((l) => l.id === id);
    if (!layer) return;
    const copy = {
      ...structuredClone(layer),
      id: generateLayerId(),
      x: layer.x + 10,
      y: layer.y + 10,
      visible: true,
    };
    set((state) => {
      const idx = state.document.layers.findIndex((l) => l.id === id);
      const next = updateDoc(state, (doc) => {
        const layers = [...doc.layers];
        layers.splice(idx + 1, 0, copy);
        return { ...doc, layers };
      });
      return { ...next, selectedLayerId: copy.id };
    });
  },

  nudgeLayer: (id, dx, dy) => {
    const layer = get().document.layers.find((l) => l.id === id);
    if (!layer || layer.visible === false) return;
    get().updateLayer(id, { x: layer.x + dx, y: layer.y + dy });
  },

  loadTemplate: (template, replace = false) => {
    const meta = get().meta;
    const from = resolveReferenceCanvas(template);
    const to = meta
      ? { width: meta.canvasWidth, height: meta.canvasHeight }
      : from;
    const scaled = scaleLayersToCanvas(template.layers, from, to, "cover");
    const cloned = cloneLayersWithNewIds(scaled);
    set((state) => {
      const next = updateDoc(state, (doc) => ({
        ...doc,
        layers: replace ? cloned : [...doc.layers, ...cloned],
      }));
      const firstId = cloned[0]?.id ?? null;
      return { ...next, selectedLayerId: firstId };
    });
  },

  trackUploadedAsset: (src) => {
    set((state) => ({
      uploadedAssets: state.uploadedAssets.includes(src)
        ? state.uploadedAssets
        : [...state.uploadedAssets, src],
    }));
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({
      historyIndex: newIndex,
      document: structuredClone(history[newIndex]),
      selectedLayerId: null,
      pendingEffectPreview: null,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({
      historyIndex: newIndex,
      document: structuredClone(history[newIndex]),
      selectedLayerId: null,
      pendingEffectPreview: null,
    });
  },

  getSelectedLayer: () => {
    const { selectedLayerId, document } = get();
    if (!selectedLayerId) return null;
    return document.layers.find((l) => l.id === selectedLayerId) ?? null;
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));

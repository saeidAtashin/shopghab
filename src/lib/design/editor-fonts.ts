import {
  getUseFontOption,
  loadUseFonts,
  USE_FONT_OPTIONS,
} from "@/lib/fonts/use-fonts";

export type EditorFontOption = {
  family: string;
  label: string;
  src: string;
};

const CORE_EDITOR_FONTS: EditorFontOption[] = [
  {
    family: "CaseEditorVazirmatn",
    label: "وزیرمتن",
    src: "/fonts/editor/Vazirmatn-Regular.woff2",
  },
  {
    family: "CaseEditorSorena",
    label: "سورنا",
    src: "/fonts/editor/Sorena-Normal.ttf",
  },
  {
    family: "CaseEditorPixel",
    label: "پیکسل",
    src: "/fonts/editor/A-Pixel.ttf",
  },
  {
    family: "CaseEditorCristik",
    label: "کریستیک",
    src: "/fonts/editor/Cristik.ttf",
  },
];

/** Canvas-safe font family names (not CSS variables). */
export const EDITOR_FONT_OPTIONS: EditorFontOption[] = [
  ...CORE_EDITOR_FONTS,
  ...USE_FONT_OPTIONS.map(({ family, label, src }) => ({ family, label, src })),
];

export const DEFAULT_EDITOR_FONT = CORE_EDITOR_FONTS[0].family;

const CORE_BY_FAMILY = new Map(
  CORE_EDITOR_FONTS.map((font) => [font.family, font]),
);

const LEGACY_FONT_MAP: Record<string, string> = {
  Vazirmatn: DEFAULT_EDITOR_FONT,
  "var(--font-vazirmatn)": DEFAULT_EDITOR_FONT,
  "var(--font-Sorena-Normal)": "CaseEditorSorena",
  "var(--font-pixel)": "CaseEditorPixel",
  "var(--Cristik)": "CaseEditorCristik",
  CaseEditorVazirmatn: DEFAULT_EDITOR_FONT,
  CaseEditorSorena: "CaseEditorSorena",
  CaseEditorPixel: "CaseEditorPixel",
  CaseEditorCristik: "CaseEditorCristik",
};

const loadedCore = new Set<string>();
const coreInFlight = new Map<string, Promise<void>>();

export function normalizeFontFamily(value: string): string {
  return LEGACY_FONT_MAP[value] ?? value;
}

function isCoreLoaded(family: string): boolean {
  if (loadedCore.has(family)) return true;
  if (typeof document === "undefined") return false;
  if (document.fonts.check(`16px "${family}"`)) {
    loadedCore.add(family);
    return true;
  }
  return false;
}

function loadCoreFont(family: string): Promise<void> {
  const option = CORE_BY_FAMILY.get(family);
  if (!option || isCoreLoaded(family)) return Promise.resolve();

  const existing = coreInFlight.get(family);
  if (existing) return existing;

  const promise = (async () => {
    if (typeof document === "undefined") return;
    try {
      if (isCoreLoaded(family)) return;
      const face = new FontFace(family, `url(${option.src})`);
      await face.load();
      document.fonts.add(face);
      loadedCore.add(family);
    } catch {
      // Font file may be missing in dev; canvas falls back to system font
    } finally {
      coreInFlight.delete(family);
    }
  })();

  coreInFlight.set(family, promise);
  return promise;
}

export function loadEditorFonts(families?: string[]): Promise<void> {
  const toLoad = (families?.length ? families : CORE_EDITOR_FONTS.map((f) => f.family))
    .map(normalizeFontFamily);

  const coreFamilies = toLoad.filter((family) => CORE_BY_FAMILY.has(family));
  const useFamilies = toLoad.filter((family) => Boolean(getUseFontOption(family)));

  return Promise.all([
    Promise.all(coreFamilies.map(loadCoreFont)),
    loadUseFonts(useFamilies),
  ]).then(() => undefined);
}

export function getDefaultTextBoxWidth(canvasWidth: number): number {
  return Math.round(canvasWidth * 0.85);
}

export function getTextOffsetX(
  align: "left" | "center" | "right",
  boxWidth: number,
): number {
  if (align === "center") return boxWidth / 2;
  if (align === "right") return boxWidth;
  return 0;
}

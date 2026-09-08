export type EditorFontOption = {
  family: string;
  label: string;
  src: string;
};

/** Canvas-safe font family names (not CSS variables). */
export const EDITOR_FONT_OPTIONS: EditorFontOption[] = [
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

export const DEFAULT_EDITOR_FONT = EDITOR_FONT_OPTIONS[0].family;

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

let fontsLoaded = false;
let fontsLoading: Promise<void> | null = null;

export function normalizeFontFamily(value: string): string {
  return LEGACY_FONT_MAP[value] ?? value;
}

export function loadEditorFonts(): Promise<void> {
  if (fontsLoaded) return Promise.resolve();
  if (fontsLoading) return fontsLoading;

  fontsLoading = (async () => {
    if (typeof document === "undefined") return;

    await Promise.all(
      EDITOR_FONT_OPTIONS.map(async ({ family, src }) => {
        if (document.fonts.check(`16px "${family}"`)) return;
        try {
          const face = new FontFace(family, `url(${src})`);
          await face.load();
          document.fonts.add(face);
        } catch {
          // Font file may be missing in dev; canvas falls back to system font
        }
      }),
    );

    fontsLoaded = true;
  })();

  return fontsLoading;
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

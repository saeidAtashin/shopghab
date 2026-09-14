import {
  USE_FONT_OPTIONS,
  type UseFontGeneratedOption,
} from "./use-fonts.generated";

export type UseFontOption = UseFontGeneratedOption;

export { USE_FONT_OPTIONS };

const loadedFamilies = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

export function getUseFontOption(family: string): UseFontOption | undefined {
  return USE_FONT_OPTIONS.find((f) => f.family === family);
}

export function normalizeUseFont(family: string): string | undefined {
  return getUseFontOption(family)?.family;
}

function isFaceLoaded(family: string): boolean {
  if (loadedFamilies.has(family)) return true;
  if (typeof document === "undefined") return false;
  for (const face of document.fonts) {
    if (face.family === family && face.status === "loaded") {
      loadedFamilies.add(family);
      return true;
    }
  }
  return false;
}

export function loadUseFonts(families: string[]): Promise<void> {
  const pending = families.filter(
    (family) => getUseFontOption(family) && !isFaceLoaded(family),
  );
  if (pending.length === 0) return Promise.resolve();

  return Promise.all(pending.map((family) => loadOne(family))).then(
    () => undefined,
  );
}

function loadOne(family: string): Promise<void> {
  if (isFaceLoaded(family)) return Promise.resolve();
  const existing = inFlight.get(family);
  if (existing) return existing;

  const option = getUseFontOption(family);
  if (!option) return Promise.resolve();

  const promise = (async () => {
    if (typeof document === "undefined") return;
    try {
      if (isFaceLoaded(family)) return;
      const face = new FontFace(family, `url("${option.src}")`);
      await face.load();
      document.fonts.add(face);
      loadedFamilies.add(family);
    } catch {
      // Font may be missing or unsupported in this environment
    } finally {
      inFlight.delete(family);
    }
  })();

  inFlight.set(family, promise);
  return promise;
}

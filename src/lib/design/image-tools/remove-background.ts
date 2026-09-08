import type { ImageToolProgress } from "./types";

export async function removeBackgroundFromImage(
  src: string,
  onProgress?: ImageToolProgress,
): Promise<Blob> {
  onProgress?.("در حال حذف پس‌زمینه...");
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await removeBackground(src, {
    progress: (_key, current, total) => {
      if (total > 0) {
        onProgress?.(`در حال پردازش... ${Math.round((current / total) * 100)}٪`);
      }
    },
  });
  return blob;
}

import type Konva from "konva";

export async function exportStageToPng(
  stage: Konva.Stage,
  pixelRatio = 2,
): Promise<string> {
  stage.batchDraw();
  return stage.toDataURL({ pixelRatio, mimeType: "image/png" });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportAndDownload(stage: Konva.Stage, filename: string) {
  const dataUrl = await exportStageToPng(stage, 3);
  downloadDataUrl(dataUrl, filename);
}

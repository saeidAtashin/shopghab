import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import sharp from "sharp";

import { MockupError } from "./errors";
import { publishValidatedWebp } from "./output";

const execFileAsync = promisify(execFile);

function jsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function photoshopScript(options: {
  psdPath: string;
  artworkPath: string;
  outputPath: string;
  smartObjectName: string;
}): string {
  return `#target photoshop
app.displayDialogs = DialogModes.NO;
function findLayer(container, name) {
  for (var i = 0; i < container.layers.length; i++) {
    var layer = container.layers[i];
    if (layer.name === name) return layer;
    if (layer.typename === "LayerSet") {
      var nested = findLayer(layer, name);
      if (nested) return nested;
    }
  }
  return null;
}
var psdFile = new File("${jsString(options.psdPath)}");
var artFile = new File("${jsString(options.artworkPath)}");
var outFile = new File("${jsString(options.outputPath)}");
app.open(psdFile);
var doc = app.activeDocument;
var layer = findLayer(doc, "${jsString(options.smartObjectName)}");
if (!layer) {
  doc.close(SaveOptions.DONOTSAVECHANGES);
  throw new Error("missing smart object");
}
doc.activeLayer = layer;
var desc = new ActionDescriptor();
desc.putPath(charIDToTypeID("null"), artFile);
executeAction(stringIDToTypeID("placedLayerReplaceContents"), desc, DialogModes.NO);
var opts = new PNGSaveOptions();
doc.saveAs(outFile, opts, true, Extension.LOWERCASE);
doc.close(SaveOptions.DONOTSAVECHANGES);
`;
}

export async function renderPhotoshopMockup(options: {
  psdPath: string;
  artworkPath: string;
  outputPath: string;
  thumbPath: string;
  smartObjectName: string;
  quality: number;
  thumbEdge: number;
}): Promise<{ width: number; height: number }> {
  const exe = process.env.PHOTOSHOP_EXE?.trim();
  if (!exe) throw new MockupError("photoshopMissing");
  if (!options.smartObjectName.trim()) throw new MockupError("smartObjectMissing");

  const dir = mkdtempSync(join(tmpdir(), "shopghab-photoshop-"));
  const jsxPath = join(dir, "render.jsx");
  const pngPath = join(dir, "mockup.png");
  const tempImage = join(dir, "out.webp");
  const tempThumb = join(dir, "thumb.webp");
  writeFileSync(
    jsxPath,
    photoshopScript({
      psdPath: options.psdPath,
      artworkPath: options.artworkPath,
      outputPath: pngPath,
      smartObjectName: options.smartObjectName,
    }),
    "utf8",
  );

  try {
    await execFileAsync(exe, ["-r", jsxPath], { timeout: 180_000 });
    const webp = await sharp(pngPath).webp({ quality: options.quality }).toBuffer();
    writeFileSync(tempImage, webp);
    const thumb = await sharp(webp)
      .resize(options.thumbEdge, options.thumbEdge, { fit: "inside" })
      .webp({ quality: 80 })
      .toBuffer();
    writeFileSync(tempThumb, thumb);
    const size = await publishValidatedWebp(tempImage, options.outputPath);
    await publishValidatedWebp(tempThumb, options.thumbPath);
    return size;
  } catch (error) {
    if (error instanceof MockupError) throw error;
    throw new MockupError("unsupported");
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 40 });
    } catch {
      // A locked temp directory must not fail a file that was already published.
    }
  }
}

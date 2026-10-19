import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

import type { MockupTemplateConfig } from "./types";

export function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk: Buffer | string) => {
      hash.update(chunk);
    });
    stream.on("error", reject);
    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });
}

export function templateSettingsHash(template: MockupTemplateConfig): string {
  const payload = JSON.stringify({
    id: template.id,
    version: template.version,
    renderer: template.renderer,
    output: template.output,
    printable: template.printable,
    fill: template.fill,
    fit: template.fit,
    cornerRadius: template.cornerRadius,
    displacementScale: template.displacementScale,
    overlays: template.overlays ?? [],
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function mockupContentHash(artworkHash: string, template: MockupTemplateConfig): string {
  return createHash("sha256").update(artworkHash).update(templateSettingsHash(template)).digest("hex");
}

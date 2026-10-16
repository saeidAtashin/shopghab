import type { MockupTemplateConfig } from "@/lib/mockups/types";

/**
 * These four PSDs are registered but disabled. `npm run mockups:inspect` lists
 * layers and Smart Objects only. Leave `enabled` false until a printable region
 * or Smart Object name from that report is filled in. Do not guess coordinates.
 */
function disabledTemplate(id: string, name: string, file: string, smartObjectName: string): MockupTemplateConfig {
  return {
    id,
    name,
    psdPath: `psd/${file}`,
    enabled: false,
    renderer: "prepared",
    version: "0",
    default: false,
    output: { width: 1600, height: 1600, quality: 82, thumbEdge: 400 },
    printable: { width: 0, height: 0, smartObjectName },
    maskPath: null,
    basePath: null,
    shadePath: null,
    highlightPath: null,
    displacementPath: null,
    displacementScale: 0,
    fit: "contain",
    fill: { strategy: "blur", sigma: 24 },
    cornerRadius: 0,
  };
}

export const mockupTemplates: MockupTemplateConfig[] = [
  disabledTemplate(
    "iphone-17-pro-cover",
    "قاب آیفون ۱۷ پرو",
    "iphone-17-pro-cover.psd",
    "[YOUR IMAGE HERE] - Print",
  ),
  disabledTemplate(
    "iphone-pro-case",
    "قاب آیفون پرو",
    "iphone-pro-case.psd",
    "Place your design here (Double click to edit)",
  ),
  disabledTemplate(
    "iphone-14-pro-matt-case",
    "قاب مات آیفون ۱۴ پرو",
    "iphone-14-pro-matt-case.psd",
    "Design",
  ),
  disabledTemplate(
    "iphone-pro-case-in-hand",
    "قاب آیفون پرو در دست",
    "iphone-pro-case-in-hand.psd",
    "[YOUR IMAGE HERE]",
  ),
];

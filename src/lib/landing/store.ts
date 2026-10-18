import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  DEFAULT_LANDING_SECTIONS,
  landingSectionsSchema,
  parseLandingSections,
  type LandingSections,
} from "./sections";

export function landingSectionsPath(): string {
  return join(process.cwd(), "data", "landing-sections.json");
}

export function readLandingSections(): LandingSections {
  const file = landingSectionsPath();
  if (!existsSync(file)) return structuredClone(DEFAULT_LANDING_SECTIONS);
  try {
    return parseLandingSections(JSON.parse(readFileSync(file, "utf8")));
  } catch {
    return structuredClone(DEFAULT_LANDING_SECTIONS);
  }
}

export function writeLandingSections(input: LandingSections): LandingSections {
  const validated = landingSectionsSchema.parse(input);
  const file = landingSectionsPath();
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
  return validated;
}

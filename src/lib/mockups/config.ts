import { assertSafeId, mockupRoot, resolveInside } from "./paths";
import type { FillStrategy, MockupTemplateConfig } from "./types";
import { mockupTemplates } from "../../../mockup-templates/templates.config";

const FILL_STRATEGIES = new Set(["solid", "edge-extend", "blur"]);

function assertRelative(root: string, value: string | null): void {
  if (!value) return;
  resolveInside(root, value);
}

function assertFill(fill: FillStrategy): void {
  if (!FILL_STRATEGIES.has(fill.strategy)) throw new Error("Mockup fill strategy is not supported.");
  if (fill.strategy === "solid" && !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(fill.color)) {
    throw new Error("Solid fill requires a hex color.");
  }
}

export function validateMockupTemplates(templates: MockupTemplateConfig[], templateRoot: string): MockupTemplateConfig[] {
  const ids = new Set<string>();
  for (const template of templates) {
    assertSafeId(template.id);
    if (ids.has(template.id)) throw new Error(`Duplicate mockup template id: ${template.id}`);
    ids.add(template.id);
    if (!template.name.trim() || !template.version.trim()) {
      throw new Error(`Template ${template.id} needs a name and version.`);
    }
    if (template.renderer !== "prepared" && template.renderer !== "photoshop") {
      throw new Error(`Template ${template.id} has an unknown renderer.`);
    }
    if (template.fit !== "contain") throw new Error(`Template ${template.id} must use contain fit.`);
    if (template.output.width < 1 || template.output.height < 1 || template.output.thumbEdge < 1) {
      throw new Error(`Template ${template.id} has invalid output dimensions.`);
    }
    if (template.output.quality < 1 || template.output.quality > 100) {
      throw new Error(`Template ${template.id} quality must be between 1 and 100.`);
    }
    if (template.cornerRadius < 0 || template.displacementScale < 0) {
      throw new Error(`Template ${template.id} has a negative radius or displacement scale.`);
    }
    assertFill(template.fill);
    assertRelative(templateRoot, template.psdPath);
    assertRelative(templateRoot, template.maskPath);
    assertRelative(templateRoot, template.basePath);
    assertRelative(templateRoot, template.shadePath);
    assertRelative(templateRoot, template.highlightPath);
    assertRelative(templateRoot, template.displacementPath);
    if (template.printable.quad && template.printable.quad.length !== 4) {
      throw new Error(`Template ${template.id} quad must have four points.`);
    }
  }

  const enabled = templates.filter((template) => template.enabled);
  const defaults = enabled.filter((template) => template.default);
  if (enabled.length > 0 && defaults.length !== 1) {
    throw new Error("Exactly one enabled mockup template must be the default product image.");
  }
  return templates;
}

export function enabledTemplates(templates: MockupTemplateConfig[]): MockupTemplateConfig[] {
  const enabled = templates.filter((template) => template.enabled);
  return [...enabled].sort((a, b) => Number(b.default) - Number(a.default));
}

export function loadProjectTemplates(cwd = process.cwd()): MockupTemplateConfig[] {
  return validateMockupTemplates(mockupTemplates, mockupRoot(cwd));
}

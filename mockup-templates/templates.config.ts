import type { MockupTemplateConfig } from "@/lib/mockups/types";

/**
 * Register each phone-case PSD here. Keep `enabled` false until
 * `npm run mockups:inspect` has identified a printable region or Smart Object
 * and the matching prepared files (or Smart Object name) are filled in.
 * Generation refuses an enabled template whose printable size is still 0.
 */
export const mockupTemplates: MockupTemplateConfig[] = [];

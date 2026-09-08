import type { ConsoleId } from "@/lib/console-catalog";
import { getRepairContent } from "@/lib/seo/repair-content";
import { howToJsonLd } from "@/lib/seo/howto-jsonld";

export function repairContentJsonLd(consoleId?: ConsoleId) {
  const content = getRepairContent(consoleId);
  return howToJsonLd({
    name: "مراحل ثبت و تعمیر کنسول",
    description: content.overview[0],
    path: consoleId ? `/repair?console=${consoleId}` : "/repair",
    steps: content.processSteps,
  });
}

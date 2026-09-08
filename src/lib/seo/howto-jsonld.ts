import { absoluteUrl } from "./site";

export function howToJsonLd(input: {
  name: string;
  description?: string;
  path: string;
  steps: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: absoluteUrl(input.path),
    step: input.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: text,
      text,
    })),
  };
}

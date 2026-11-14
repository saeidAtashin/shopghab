import type { ReadyCase } from "../cases/types";
import { absoluteUrl, SITE_BRAND, SITE_NAME } from "./site";

/** Catalog prices are stored in toman; schema.org expects ISO 4217 rials. */
function tomanToIrr(toman: number): number {
  return toman * 10;
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "fa-IR",
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    publisher: { "@id": `${absoluteUrl("/")}#business` },
  };
}

export function itemListJsonLd(input: {
  name: string;
  path: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: absoluteUrl(input.path),
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "fa-IR",
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    publisher: { "@id": `${absoluteUrl("/")}#business` },
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  path: string;
  steps: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "fa-IR",
    step: input.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };
}

export function designProductJsonLd(input: {
  name: string;
  description: string;
  path: string;
  image?: string;
  sku: string;
  category?: string;
  priceToman?: number;
}) {
  const image = input.image?.trim();
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    sku: input.sku,
    brand: {
      "@type": "Brand",
      name: SITE_BRAND,
    },
    ...(input.category ? { category: input.category } : {}),
    ...(image ? { image: image.startsWith("http") ? image : absoluteUrl(image) } : {}),
  };

  if (typeof input.priceToman === "number" && Number.isFinite(input.priceToman) && input.priceToman > 0) {
    product.offers = {
      "@type": "Offer",
      price: tomanToIrr(input.priceToman),
      priceCurrency: "IRR",
      url: absoluteUrl(input.path),
      availability: "https://schema.org/InStock",
    };
  }

  return product;
}

export function readyCaseJsonLd(input: {
  product: ReadyCase;
  path: string;
  brandName?: string;
  modelName?: string;
}) {
  const productUrl = absoluteUrl(input.path);
  const availability = input.product.inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.product.title,
    url: productUrl,
    image: absoluteUrl(input.product.image),
    description: input.product.description,
    sku: input.product.id,
    itemCondition: "https://schema.org/NewCondition",
    brand: {
      "@type": "Brand",
      name: input.brandName ?? SITE_NAME,
    },
    ...(input.modelName
      ? {
          model: input.modelName,
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: tomanToIrr(input.product.price),
      priceCurrency: "IRR",
      url: productUrl,
      availability,
    },
  };
}

import { absoluteUrl, SITE_NAME } from "./site";
import type { ReadyCase } from "../cases/types";
import type { ShopProduct } from "../shop";

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
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function blogPostingJsonLd(input: {
  title: string;
  description: string;
  path: string;
  coverImage: string;
  publishedAt: string;
}) {
  const imageUrl = input.coverImage.startsWith("http")
    ? input.coverImage
    : absoluteUrl(input.coverImage);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    image: imageUrl,
    datePublished: input.publishedAt,
    inLanguage: "fa-IR",
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    isPartOf: { "@id": `${absoluteUrl("/blog")}#blog` },
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
      price: input.product.price,
      priceCurrency: "IRR",
      url: productUrl,
      availability,
    },
  };
}

export function productOfferJsonLd(input: {
  product: ShopProduct;
  path: string;
  description?: string;
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
    description:
      input.description ?? input.product.highlights?.join(" - "),
    category: `${input.product.category}:${input.product.console}`,
    sku: input.product.id,
    itemCondition:
      input.product.condition === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      price: input.product.price,
      priceCurrency: "IRR",
      url: productUrl,
      availability,
    },
  };
}

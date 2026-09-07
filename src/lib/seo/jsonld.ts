import { absoluteUrl, SITE_NAME } from "./site";

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

export function aboutPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "fa-IR",
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    mainEntity: { "@id": `${absoluteUrl("/")}#business` },
    publisher: { "@id": `${absoluteUrl("/")}#business` },
  };
}

export function contactPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "fa-IR",
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    mainEntity: { "@id": `${absoluteUrl("/")}#business` },
    publisher: { "@id": `${absoluteUrl("/")}#business` },
  };
}

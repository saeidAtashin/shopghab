import type { Metadata } from "next";

import {
  BRAND_SHORT,
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from "./site";

function buildFullTitle(pageTitle: string): string {
  if (pageTitle === SITE_NAME) return pageTitle;
  if (pageTitle.includes(SITE_NAME) || pageTitle.includes(BRAND_SHORT)) {
    return pageTitle;
  }
  return `${pageTitle} | ${SITE_NAME}`;
}

export type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
  type?: "website" | "article";
};

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description ?? SITE_TAGLINE;
  const canonicalPath = input.path ?? "/";
  const canonical = absoluteUrl(canonicalPath);
  const ogImage = input.ogImage ?? DEFAULT_OG_IMAGE;
  const ogImageUrl = ogImage.startsWith("http")
    ? ogImage
    : absoluteUrl(ogImage);
  const fullTitle = buildFullTitle(input.title);

  return {
    title: input.title,
    description,
    keywords: input.keywords,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: getSiteUrl() }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      telephone: true,
      email: false,
      address: false,
    },
    alternates: {
      canonical: canonical,
      languages: {
        "fa-IR": canonical,
      },
    },
    robots: input.noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: input.type ?? "website",
      locale: SITE_LOCALE,
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
    metadataBase: new URL(getSiteUrl()),
    category: "shopping",
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: SITE_NAME,
    description: SITE_TAGLINE,
    path: "/",
    keywords: [
      "قاب گوشی",
      "خرید قاب گوشی",
      "قاب سفارشی",
      "شاپ قاب",
      "Shopghab",
      "قاب آیفون",
      "قاب سامسونگ",
    ],
  }),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  category: "shopping",
  icons: {
    icon: "/logos/logo-nobg.png",
    shortcut: "/logos/logo-nobg.png",
    apple: "/logos/logo-nobg.png",
  },
};

import type { Metadata } from "next";

import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from "./site";

export type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
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
  const ogImageWidth = input.ogImageWidth ?? 1200;
  const ogImageHeight = input.ogImageHeight ?? 630;
  const fullTitle =
    input.title === SITE_NAME ? input.title : `${input.title} | ${SITE_NAME}`;

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
          width: ogImageWidth,
          height: ogImageHeight,
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
    category: "technology",
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: SITE_NAME,
    description: SITE_TAGLINE,
    path: "/",
    keywords: [
      "قاب موبایل",
      "طراحی قاب",
      "قاب آیفون",
      "قاب سامسونگ",
      "قاب شیائومی",
      "قاب سفارشی",
      "شاپ‌قاب",
      "قاب‌کده",
    ],
  }),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  icons: {
    icon: "/logos/shop-ghab-logo.png",
    shortcut: "/logos/shop-ghab-logo.png",
    apple: "/logos/shop-ghab-logo.png",
  },
};

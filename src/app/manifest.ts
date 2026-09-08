import type { MetadataRoute } from "next";

import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from "../lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "شاپ‌قاب",
    description: SITE_TAGLINE,
    start_url: absoluteUrl("/"),
    display: "standalone",
    background_color: "#000000",
    theme_color: "#f59e0b",
    lang: "fa",
    dir: "rtl",
    orientation: "portrait",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/logos/shop-ghab-logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

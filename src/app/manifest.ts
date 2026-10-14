import type { MetadataRoute } from "next";

import { SITE_BRAND, SITE_NAME, SITE_TAGLINE, SITE_THEME_COLOR } from "../lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_BRAND,
    description: SITE_TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: SITE_THEME_COLOR,
    lang: "fa",
    dir: "rtl",
    orientation: "portrait",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from "../lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "تعمیر کنسول",
    description: SITE_TAGLINE,
    start_url: absoluteUrl("/"),
    display: "standalone",
    background_color: "#000000",
    theme_color: "#06b6d4",
    lang: "fa",
    dir: "rtl",
    orientation: "portrait",
    categories: ["business", "utilities"],
    icons: [
      {
        src: "/logos/logo-nobg.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

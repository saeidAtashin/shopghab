import {
  DEFAULT_OG_IMAGE,
  SITE_ADDRESS,
  SITE_HOURS,
  SITE_NAME,
  SITE_PHONE,
  SITE_TAGLINE,
  absoluteUrl,
} from "../../../lib/seo/site";
import JsonLd from "./JsonLd";

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${absoluteUrl("/")}#business`,
        name: SITE_NAME,
        description: SITE_TAGLINE,
        url: absoluteUrl("/"),
        telephone: SITE_PHONE,
        image: absoluteUrl(DEFAULT_OG_IMAGE),
        priceRange: "IRR",
        openingHours: SITE_HOURS,
        address: {
          "@type": "PostalAddress",
          ...SITE_ADDRESS,
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "تهران",
        },
        knowsAbout: [
          "قاب گوشی",
          "قاب سفارشی",
          "چاپ روی قاب",
          "قاب آیفون",
          "قاب سامسونگ",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        url: absoluteUrl("/"),
        name: SITE_NAME,
        inLanguage: "fa-IR",
        publisher: { "@id": `${absoluteUrl("/")}#business` },
      },
    ],
  };

  return <JsonLd data={schema} />;
}

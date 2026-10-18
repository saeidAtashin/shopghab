import {
  DEFAULT_OG_IMAGE,
  SITE_ADDRESS,
  SITE_ALTERNATE_NAMES,
  SITE_BRAND,
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
        name: SITE_BRAND,
        alternateName: [...SITE_ALTERNATE_NAMES],
        description: SITE_TAGLINE,
        url: absoluteUrl("/"),
        telephone: SITE_PHONE,
        image: absoluteUrl(DEFAULT_OG_IMAGE),
        priceRange: "۸۷۰٬۰۰۰–۱٬۲۰۰٬۰۰۰ تومان",
        address: {
          "@type": "PostalAddress",
          ...SITE_ADDRESS,
        },
        areaServed: {
          "@type": "Country",
          name: "Iran",
        },
        knowsAbout: [
          "فروش قاب موبایل",
          "طراحی قاب موبایل",
          "چاپ قاب",
          "قاب آیفون",
          "قاب سامسونگ",
          "قاب شیائومی",
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

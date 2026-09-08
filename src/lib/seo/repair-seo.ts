import {
  consoleCatalog,
  consoleIds,
  getRepairService,
  type ConsoleId,
} from "../console-catalog";
import {
  buildRepairCanonicalPath,
  isConsoleId,
  type RepairPrefill,
} from "../repair-links";
import { webPageJsonLd } from "./jsonld";
import { absoluteUrl, SITE_NAME } from "./site";
import { REPAIR_DEFAULT_DESCRIPTION } from "./repair-content";

const DEFAULT_TITLE = "ثبت سفارش تعمیر کنسول";
const DEFAULT_DESCRIPTION = REPAIR_DEFAULT_DESCRIPTION;
const DEFAULT_KEYWORDS = [
  "ثبت تعمیر کنسول",
  "سفارش تعمیر ps5",
  "سفارش تعمیر ps4",
  "تعمیر xbox",
  "تعمیر آنلاین کنسول",
];

export type RepairSeoContext = {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogImage?: string;
  noIndex: boolean;
  consoleId?: ConsoleId;
};

type SearchParamValue = string | string[] | undefined;

function firstParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  return value?.trim() || undefined;
}

export function repairPrefillFromPageSearchParams(
  searchParams: Record<string, SearchParamValue>,
): RepairPrefill {
  const consoleParam = firstParam(searchParams.console) ?? "";
  const consoleId = isConsoleId(consoleParam) ? consoleParam : undefined;

  return {
    consoleId,
    issue: firstParam(searchParams.issue),
    description: firstParam(searchParams.description),
  };
}

export function resolveRepairSeo(
  searchParams: Record<string, SearchParamValue>,
): RepairSeoContext {
  const prefill = repairPrefillFromPageSearchParams(searchParams);
  const canonicalPath = buildRepairCanonicalPath(prefill);
  const hasIssue = Boolean(prefill.issue);
  const hasDescription = Boolean(prefill.description);

  if (prefill.consoleId) {
    const service = getRepairService(prefill.consoleId);
    const config = consoleCatalog[prefill.consoleId];
    const title = `ثبت سفارش ${service?.title ?? `تعمیر ${config.title}`}`;
    const description =
      service?.seoDescription ??
      service?.description ??
      `ثبت آنلاین درخواست تعمیر ${config.title} با شرح مشکل و تماس کارشناسان.`;

    return {
      title,
      description,
      keywords: service?.keywords ?? [
        `ثبت تعمیر ${config.title}`,
        `سفارش تعمیر ${config.title}`,
        ...DEFAULT_KEYWORDS,
      ],
      canonicalPath,
      ogImage: service?.cover ?? service?.image,
      noIndex: false,
      consoleId: prefill.consoleId,
    };
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    canonicalPath,
    noIndex: hasIssue || hasDescription,
  };
}

function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: {
      "@type": "LocalBusiness",
      name: SITE_NAME,
      "@id": `${absoluteUrl("/")}#business`,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "تهران",
    },
  };
}

export function repairPageJsonLd(
  ctx: RepairSeoContext,
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [
    webPageJsonLd({
      name: ctx.title,
      description: ctx.description,
      path: ctx.canonicalPath,
    }),
  ];

  if (ctx.consoleId) {
    const service = getRepairService(ctx.consoleId);
    if (service) {
      schemas.push(
        serviceJsonLd({
          name: service.title,
          description: service.seoDescription ?? service.description,
          path: ctx.canonicalPath,
        }),
      );
    }
  }

  return schemas;
}

/** Indexable repair landing URLs for sitemap. */
export function repairSitemapPaths(): string[] {
  return ["/repair", ...consoleIds.map((id) => `/repair?console=${id}`)];
}

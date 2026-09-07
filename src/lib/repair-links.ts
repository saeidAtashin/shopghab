import {
  consoleCatalog,
  consoleIds,
  getRepairService,
  type ConsoleId,
} from "./console-catalog";

export const consoleRepairIcons: Record<ConsoleId, string> = {
  ps5: "/icons/ps5.svg",
  ps4: "/icons/ps4.svg",
  xbox: "/icons/xbox.svg",
};

export function isConsoleId(value: string): value is ConsoleId {
  return (consoleIds as string[]).includes(value);
}

export function consoleIdFromRepairSlug(slug: string): ConsoleId | undefined {
  return consoleIds.find((id) => consoleCatalog[id].repairSlug === slug);
}

export function consoleIdFromIssueSlug(slug: string): ConsoleId | undefined {
  if (slug.startsWith("ps5")) return "ps5";
  if (slug.startsWith("ps4")) return "ps4";
  if (slug.startsWith("xbox")) return "xbox";
  return undefined;
}

export function consoleIdFromGameInstallSlug(
  slug: string,
): ConsoleId | undefined {
  if (slug === "ps5" || slug === "ps4") return slug;
  if (slug === "xbox-one" || slug === "xbox-series") return "xbox";
  return undefined;
}

export type RepairPrefill = {
  consoleId?: ConsoleId;
  issue?: string;
  description?: string;
};

/** Canonical URL for SEO — strips one-off prefill params. */
export function buildRepairCanonicalPath(prefill?: RepairPrefill): string {
  if (prefill?.consoleId) {
    return `/repair?console=${prefill.consoleId}`;
  }
  return "/repair";
}

export function buildRepairHref(prefill?: RepairPrefill): string {
  if (!prefill?.consoleId && !prefill?.issue && !prefill?.description) {
    return "/repair";
  }

  const params = new URLSearchParams();
  if (prefill.consoleId) params.set("console", prefill.consoleId);
  if (prefill.issue) params.set("issue", prefill.issue);
  if (prefill.description) params.set("description", prefill.description);

  return `/repair?${params.toString()}`;
}

export function parseRepairSearchParams(
  searchParams: URLSearchParams,
): RepairPrefill {
  const consoleParam = searchParams.get("console")?.trim() ?? "";
  const consoleId = isConsoleId(consoleParam) ? consoleParam : undefined;

  return {
    consoleId,
    issue: searchParams.get("issue")?.trim() || undefined,
    description: searchParams.get("description")?.trim() || undefined,
  };
}

export function getRepairDeviceLabel(consoleId: ConsoleId): string {
  return (
    getRepairService(consoleId)?.title ??
    `تعمیر ${consoleCatalog[consoleId].title}`
  );
}

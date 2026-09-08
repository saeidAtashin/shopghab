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

function normalizeDeviceName(deviceName: string): string {
  return deviceName.toLowerCase().replace(/[\s_-]+/g, "");
}

/** Map API device `name` (ps5, ps4, xbox1, xboxone, …) to a console id. */
export function consoleIdFromDeviceName(
  deviceName: string,
): ConsoleId | undefined {
  const key = normalizeDeviceName(deviceName);

  if (key.includes("ps5")) return "ps5";
  if (key.includes("ps4")) return "ps4";
  if (key.includes("xbox")) return "xbox";

  return undefined;
}

/** Map API device `name` (ps5, ps4, xbox1, xboxone, …) to the repair icon asset. */
export function getRepairDeviceIcon(deviceName: string): string {
  const key = normalizeDeviceName(deviceName);

  if (key.includes("ps5")) return consoleRepairIcons.ps5;
  if (key.includes("ps4")) return consoleRepairIcons.ps4;
  if (key.includes("xbox")) return consoleRepairIcons.xbox;

  return consoleRepairIcons.xbox;
}

export function getRepairDeviceDisplayName(deviceName: string): string {
  const key = normalizeDeviceName(deviceName);

  if (key === "ps5") return "PS5";
  if (key === "ps4") return "PS4";
  if (key === "xbox1" || key === "xboxseries") return "Xbox Series";
  if (key === "xboxone") return "Xbox One";
  if (key.includes("xbox")) return "Xbox";

  return deviceName;
}

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

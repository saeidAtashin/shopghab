/** Resolve a /designed/... path, optionally prefixing NEXT_PUBLIC_DESIGNED_CDN_URL. */
export function designedAssetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const cdn = process.env.NEXT_PUBLIC_DESIGNED_CDN_URL?.trim();
  if (cdn && normalized.startsWith("/designed/")) {
    return `${cdn.replace(/\/$/, "")}${normalized}`;
  }
  return normalized;
}

/** Hostname from NEXT_PUBLIC_DESIGNED_CDN_URL for next.config remotePatterns. */
export function getDesignedCdnHostname(): string | undefined {
  const cdn = process.env.NEXT_PUBLIC_DESIGNED_CDN_URL?.trim();
  if (!cdn) return undefined;
  try {
    return new URL(cdn).hostname;
  } catch {
    return undefined;
  }
}

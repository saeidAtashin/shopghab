export function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withoutQuery = path.split("?")[0] ?? path;
  return withoutQuery.replace(/\/+$/, "") || "/";
}

/** Path including allowed query keys (e.g. repair console filter). */
export function pathForBreadcrumbMatch(path: string) {
  if (!path.includes("?")) return normalizePath(path);
  const [pathname, query] = path.split("?");
  if (!pathname.startsWith("/repair") || !query) return normalizePath(path);
  const params = new URLSearchParams(query);
  const console = params.get("console")?.trim();
  if (console) return `/repair?console=${console}`;
  return normalizePath(path);
}

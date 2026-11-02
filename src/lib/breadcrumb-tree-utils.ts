export function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withoutQuery = path.split("?")[0] ?? path;
  return withoutQuery.replace(/\/+$/, "") || "/";
}

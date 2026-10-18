export function isNavActive(pathname: string, href: string) {
  const [path, query] = href.split("?");
  const target = path || "/";
  if (query) return pathname === target;
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
}

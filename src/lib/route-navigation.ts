export const DEFAULT_ROUTE_LOADER_LABEL = "در حال بارگذاری…";
export const DESIGN_ROUTE_LOADER_LABEL = "در حال رفتن به صفحه طراحی";

export const designRouteLoaderProps = {
  "data-route-loader-label": DESIGN_ROUTE_LOADER_LABEL,
} as const;

type RouteNavigationListener = (label: string) => void;

const listeners = new Set<RouteNavigationListener>();

export function beginRouteNavigation(label = DESIGN_ROUTE_LOADER_LABEL): void {
  for (const listener of listeners) listener(label);
}

export function subscribeRouteNavigation(listener: RouteNavigationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

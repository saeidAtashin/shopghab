import {
  getBrandLoader,
  isBrandLoaderSlug,
  type BrandLoaderSlug,
} from "@/lib/brand-route-loaders";
import type { PreferredBrandLoaderSlug } from "@/lib/preferred-brand-loader";

type Props = {
  brandSlug: PreferredBrandLoaderSlug;
  runId: number;
};

export function DefaultRouteLoaderSvg({ runId }: { runId: number }) {
  return (
    <svg
      key={runId}
      className="route-loader-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 125"
      aria-hidden="true"
    >
      <title>Loading</title>
      <path
        className="route-loader-path route-loader-path-1"
        pathLength={100}
        d="M24.14,41.26a1.5,1.5,0,0,1,1.48,1.48V57.27a1.5,1.5,0,0,1-1.48,1.48H9.61a1.5,1.5,0,0,1-1.48-1.48V42.73a1.5,1.5,0,0,1,1.48-1.48H24.14m0-2.22H9.61a3.71,3.71,0,0,0-3.69,3.69V57.27A3.71,3.71,0,0,0,9.61,61H24.14a3.71,3.71,0,0,0,3.69-3.69V42.73A3.71,3.71,0,0,0,24.14,39Z"
      />
      <path
        className="route-loader-path route-loader-path-2"
        pathLength={100}
        d="M61.21,41.26A8.74,8.74,0,1,1,52.46,50a8.75,8.75,0,0,1,8.74-8.74m0-2.22a11,11,0,1,0,11,11,11,11,0,0,0-11-11Z"
      />
      <path
        className="route-loader-path route-loader-path-3"
        pathLength={100}
        d="M84.61,50l9.16-9.16a1.05,1.05,0,0,0-1.49-1.49l-9.16,9.16L74,39.35a1.05,1.05,0,0,0-1.49,1.49L81.63,50l-9.16,9.16A1.05,1.05,0,1,0,74,60.65l9.16-9.16,9.16,9.16a1.05,1.05,0,0,0,1.49-1.49Z"
      />
      <path
        className="route-loader-path route-loader-path-4"
        pathLength={100}
        d="M39.79,42.39l7.9,16,.06.12H31.83l.06-.12,7.9-16m0-3.35c-.65,0-1.3.5-1.79,1.5l-8.29,16.8c-1,2,0,3.63,2.25,3.63H47.62c2.22,0,3.24-1.63,2.25-3.63l-8.29-16.8c-.49-1-1.14-1.5-1.79-1.5Z"
      />
    </svg>
  );
}

export function BrandRouteLoaderSvg({
  brandSlug,
  runId,
}: {
  brandSlug: BrandLoaderSlug;
  runId: number;
}) {
  const config = getBrandLoader(brandSlug);
  if (!config) return <DefaultRouteLoaderSvg runId={runId} />;

  return (
    <svg
      key={runId}
      className="route-loader-svg route-loader-svg--brand"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={config.viewBox}
      aria-hidden="true"
    >
      <title>Loading</title>
      {config.paths.map((d, index) => (
        <path
          key={index}
          className="route-loader-path route-loader-path-1"
          pathLength={100}
          d={d}
          style={{ strokeWidth: config.strokeWidth }}
        />
      ))}
    </svg>
  );
}

export default function RouteLoaderSvg({ brandSlug, runId }: Props) {
  if (brandSlug && isBrandLoaderSlug(brandSlug)) {
    return <BrandRouteLoaderSvg brandSlug={brandSlug} runId={runId} />;
  }

  return <DefaultRouteLoaderSvg runId={runId} />;
}

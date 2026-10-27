import {
  SHOPGHAB_MARK_PATHS,
  SHOPGHAB_MARK_VIEWBOX,
} from "@/lib/case-loading/shopghab-mark";
import {
  DEFAULT_LOADER_THEME,
  type LoaderTheme,
} from "@/lib/case-loading/loader-theme";

type Props = {
  runId: number;
  theme?: LoaderTheme;
};

export default function ShopghabLoaderSvg({
  runId,
  theme = DEFAULT_LOADER_THEME,
}: Props) {
  const colors = theme.colors.length
    ? theme.colors
    : DEFAULT_LOADER_THEME.colors;

  return (
    <svg
      key={runId}
      className="route-loader-svg shopghab-loader-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={SHOPGHAB_MARK_VIEWBOX}
      aria-hidden="true"
      style={{
        color: theme.glow,
        filter: `drop-shadow(0 0 18px ${hexToRgba(theme.glow, 0.45)})`,
      }}
    >
      <title>شاپ قاب</title>
      {SHOPGHAB_MARK_PATHS.map((path, index) => (
        <path
          key={index}
          className={`shopghab-loader-path shopghab-loader-path-${index + 1}`}
          pathLength={100}
          d={path.d}
          fill={colors[index] ?? path.fill}
          stroke={colors[index] ?? path.fill}
          fillRule="evenodd"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return `rgba(84, 62, 232, ${alpha})`;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

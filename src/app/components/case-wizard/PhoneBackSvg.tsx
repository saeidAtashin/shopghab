import type { PhoneModel } from "@/lib/cases/types";
import { mapGeometryToCanvas } from "@/lib/cases/phone-back";

type SvgProps = {
  model: PhoneModel;
  className?: string;
  bodyFill?: string;
  showCamera?: boolean;
};

export function PhoneBackSvg({
  model,
  className = "",
  bodyFill = "#1a1a22",
  showCamera = true,
}: SvgProps) {
  const geo = mapGeometryToCanvas(model);
  const viewBox = `0 0 ${geo.canvasWidth} ${geo.canvasHeight}`;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g id="body">
        <rect
          x={0}
          y={0}
          width={geo.canvasWidth}
          height={geo.canvasHeight}
          rx={geo.cornerRadius}
          ry={geo.cornerRadius}
          fill={bodyFill}
        />
      </g>
      {geo.logo ? (
        <circle
          cx={geo.logo.cx}
          cy={geo.logo.cy}
          r={geo.logo.r}
          fill="rgba(255,255,255,0.06)"
        />
      ) : null}
      {showCamera ? (
        <g id="camera-module">
          <rect
            x={geo.cameraModule.x}
            y={geo.cameraModule.y}
            width={geo.cameraModule.width}
            height={geo.cameraModule.height}
            rx={geo.cameraModule.cornerRadius ?? 0}
            ry={geo.cameraModule.cornerRadius ?? 0}
            fill="#252530"
            stroke="#3a3a48"
            strokeWidth={1}
          />
          <g id="lenses">
            {geo.lenses.map((lens, i) => (
              <circle
                key={i}
                className="lens"
                cx={lens.cx}
                cy={lens.cy}
                r={lens.r}
                fill="#0d0d12"
                stroke="#333340"
                strokeWidth={1}
              />
            ))}
          </g>
          {geo.lidar ? (
            <circle
              cx={geo.lidar.cx}
              cy={geo.lidar.cy}
              r={geo.lidar.r}
              fill="#12121a"
              stroke="#333340"
              strokeWidth={1}
            />
          ) : null}
          {geo.flash ? (
            <rect
              x={geo.flash.x}
              y={geo.flash.y}
              width={geo.flash.width}
              height={geo.flash.height}
              rx={2}
              fill="#f5f5dc"
              opacity={0.85}
            />
          ) : null}
        </g>
      ) : null}
    </svg>
  );
}

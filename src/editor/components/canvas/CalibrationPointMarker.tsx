import { Circle } from "react-konva";

const POINT_RADIUS = 5;
const POINT_COLOR = "#2563eb";

export function CalibrationPointMarker({
  point,
  inverseScale,
  dimmed,
}: {
  point: { x: number; y: number };
  inverseScale: number;
  dimmed?: boolean;
}) {
  return (
    <Circle
      x={point.x}
      y={point.y}
      radius={POINT_RADIUS * inverseScale}
      fill={POINT_COLOR}
      opacity={dimmed ? 0.4 : 0.8}
      stroke="#fff"
      strokeWidth={1.5 * inverseScale}
      listening={false}
    />
  );
}

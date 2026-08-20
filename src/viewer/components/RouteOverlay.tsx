import { Layer, Line, Circle, Text } from "react-konva";

interface RouteOverlayProps {
  /** Canvas-space polyline points from smoothPath */
  path: { x: number; y: number }[];
}

const ROUTE_COLOR = "#2563eb";
const ROUTE_WIDTH = 4;
const MARKER_RADIUS = 12;
const MARKER_FONT_SIZE = 14;

export function RouteOverlay({ path }: RouteOverlayProps) {
  if (path.length < 2) return null;

  const start = path[0];
  const end = path[path.length - 1];
  const flatPoints = path.flatMap(p => [p.x, p.y]);

  return (
    <Layer listening={false}>
      {/* Route polyline */}
      <Line
        points={flatPoints}
        stroke={ROUTE_COLOR}
        strokeWidth={ROUTE_WIDTH}
        lineCap="round"
        lineJoin="round"
        dash={[10, 6]}
        opacity={0.85}
      />

      {/* Start marker (A) */}
      <Circle
        x={start.x}
        y={start.y}
        radius={MARKER_RADIUS}
        fill="#16a34a"
        stroke="#ffffff"
        strokeWidth={2}
      />
      <Text
        x={start.x - MARKER_RADIUS}
        y={start.y - MARKER_FONT_SIZE / 2}
        width={MARKER_RADIUS * 2}
        height={MARKER_FONT_SIZE}
        // Route endpoint markers, not words — deliberately untranslated.
        text="A"
        fontSize={MARKER_FONT_SIZE}
        fill="#ffffff"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        listening={false}
      />

      {/* End marker (B) */}
      <Circle
        x={end.x}
        y={end.y}
        radius={MARKER_RADIUS}
        fill="#dc2626"
        stroke="#ffffff"
        strokeWidth={2}
      />
      <Text
        x={end.x - MARKER_RADIUS}
        y={end.y - MARKER_FONT_SIZE / 2}
        width={MARKER_RADIUS * 2}
        height={MARKER_FONT_SIZE}
        text="B"
        fontSize={MARKER_FONT_SIZE}
        fill="#ffffff"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Layer>
  );
}

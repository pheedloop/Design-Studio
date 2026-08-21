import { Group, Line, Rect, Text } from "react-konva";
import { CalibrationPointMarker } from "./CalibrationPointMarker";

const LINE_COLOR = "#2563eb";
const LINE_DASH = [6, 4];

export function CalibrationLine({
  p1,
  p2,
  inverseScale,
  label,
  dashed,
  dimmed,
}: {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  inverseScale: number;
  label?: string;
  dashed?: boolean;
  dimmed?: boolean;
}) {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const opacity = dimmed ? 0.4 : 0.9;

  return (
    <Group listening={false}>
      <Line
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke={LINE_COLOR}
        strokeWidth={2 * inverseScale}
        dash={dashed ? LINE_DASH.map(d => d * inverseScale) : undefined}
        opacity={opacity}
        listening={false}
      />
      <CalibrationPointMarker
        point={p1}
        inverseScale={inverseScale}
        dimmed={dimmed}
      />
      <CalibrationPointMarker
        point={p2}
        inverseScale={inverseScale}
        dimmed={dimmed}
      />
      {label && (
        <>
          <Rect
            x={midX - label.length * 4 * inverseScale}
            y={midY - 10 * inverseScale}
            width={label.length * 8 * inverseScale}
            height={18 * inverseScale}
            fill="#fff"
            cornerRadius={3 * inverseScale}
            opacity={0.9}
            listening={false}
          />
          <Text
            x={midX - label.length * 4 * inverseScale}
            y={midY - 7 * inverseScale}
            width={label.length * 8 * inverseScale}
            text={label}
            fontSize={11 * inverseScale}
            fill="#1e40af"
            fontFamily="system-ui, sans-serif"
            align="center"
            listening={false}
          />
        </>
      )}
    </Group>
  );
}

import { Circle, Group, Line, Rect, Text } from "react-konva";
import type { MeasureState } from "../hooks/useMeasureInteraction";
import type { Dimensions } from "../../../types";
import { formatMeasurement } from "../../../utils/unitConversion";
import { useLocale, useT } from "../../i18n";

interface MeasurePreviewProps {
  state: MeasureState;
  scale: number;
  dimensions: Dimensions;
}

const POINT_RADIUS = 4;
const COLOR = "#0d9488"; // teal-600
const LINE_DASH = [6, 4];

export function MeasurePreview({
  state,
  scale,
  dimensions,
}: MeasurePreviewProps) {
  // Hooks must precede the early returns below.
  const t = useT();
  const locale = useLocale();

  const { p1, p2 } = state;
  if (!p1 || !p2) return null;

  const inverseScale = 1 / scale;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const pxDist = Math.sqrt(dx * dx + dy * dy);

  if (pxDist < 2) return null;

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const label = formatMeasurement(pxDist, dimensions, t, locale);

  return (
    <Group listening={false}>
      <Line
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke={COLOR}
        strokeWidth={1.5 * inverseScale}
        dash={LINE_DASH.map(d => d * inverseScale)}
        listening={false}
      />
      <Circle
        x={p1.x}
        y={p1.y}
        radius={POINT_RADIUS * inverseScale}
        fill={COLOR}
        stroke="#fff"
        strokeWidth={1 * inverseScale}
        listening={false}
      />
      <Circle
        x={p2.x}
        y={p2.y}
        radius={POINT_RADIUS * inverseScale}
        fill={COLOR}
        stroke="#fff"
        strokeWidth={1 * inverseScale}
        listening={false}
      />
      <Rect
        x={midX - label.length * 3.5 * inverseScale}
        y={midY - 10 * inverseScale}
        width={label.length * 7 * inverseScale}
        height={18 * inverseScale}
        fill="#fff"
        cornerRadius={3 * inverseScale}
        opacity={0.9}
        listening={false}
      />
      <Text
        x={midX - label.length * 3.5 * inverseScale}
        y={midY - 7 * inverseScale}
        width={label.length * 7 * inverseScale}
        text={label}
        fontSize={11 * inverseScale}
        fill={COLOR}
        fontFamily="system-ui, sans-serif"
        fontStyle="bold"
        align="center"
        listening={false}
      />
    </Group>
  );
}

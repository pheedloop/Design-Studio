import { Arrow, Line } from "react-konva";
import type { LineGeometry, ArrowGeometry } from "../../../../types";

interface ArrowShapeProps {
  geo: LineGeometry | ArrowGeometry;
  color: string;
  strokeWidth: number;
  arrowHead: { style: "triangle" | "chevron"; size: number };
}

export function ArrowShape({
  geo,
  color,
  strokeWidth,
  arrowHead,
}: ArrowShapeProps) {
  const pts = geo.points;

  if (arrowHead.style === "chevron" && pts.length >= 4) {
    const n = pts.length;
    const x2 = pts[n - 2],
      y2 = pts[n - 1];
    const x1 = pts[n - 4],
      y1 = pts[n - 3];
    const theta = Math.atan2(y2 - y1, x2 - x1);
    const wing = Math.PI / 5; // 36° opening
    const s = arrowHead.size;
    return (
      <>
        <Line
          points={pts}
          stroke={color}
          strokeWidth={strokeWidth}
          lineCap="round"
          hitStrokeWidth={12}
        />
        <Line
          points={[
            x2 - s * Math.cos(theta - wing),
            y2 - s * Math.sin(theta - wing),
            x2,
            y2,
            x2 - s * Math.cos(theta + wing),
            y2 - s * Math.sin(theta + wing),
          ]}
          stroke={color}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
        />
      </>
    );
  }

  return (
    <Arrow
      points={[...pts]}
      stroke={color}
      strokeWidth={strokeWidth}
      fill={color}
      pointerLength={arrowHead.size}
      pointerWidth={arrowHead.size * 0.8}
      hitStrokeWidth={12}
      lineCap="round"
    />
  );
}

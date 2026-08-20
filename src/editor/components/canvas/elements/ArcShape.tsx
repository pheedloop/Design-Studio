import { Shape } from "react-konva";
import type { ArcGeometry } from "@/types";

interface ArcShapeProps {
  geo: ArcGeometry;
  color: string;
  strokeWidth: number;
}

export function ArcShape({ geo, color, strokeWidth }: ArcShapeProps) {
  const [x1, y1, cx, cy, x2, y2] = geo.points;

  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.fillStrokeShape(shape);
      }}
      stroke={color}
      strokeWidth={strokeWidth}
      hitStrokeWidth={12}
      lineCap="round"
    />
  );
}

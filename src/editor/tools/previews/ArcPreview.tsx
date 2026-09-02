import { Line, Shape, Circle } from "react-konva";
import type { ArcToolState } from "@/editor/tools/hooks/useArcInteraction";
import { BRAND, GRAY_600 } from "@/canvasColors";

const linePreviewStyle = {
  stroke: GRAY_600,
  strokeWidth: 2,
  dash: [4, 4] as number[],
  listening: false,
  lineCap: "round" as const,
} as const;

const VERTEX_RADIUS = 4;

interface ArcPreviewProps {
  state: ArcToolState;
  scale: number;
}

export function ArcPreview({ state }: ArcPreviewProps) {
  const { pointA, pointB, controlPoint, phase } = state;
  if (phase === "idle" || !pointA) return null;

  if (phase === "pickEnd" && pointB) {
    return (
      <>
        <Line
          points={[pointA.x, pointA.y, pointB.x, pointB.y]}
          {...linePreviewStyle}
        />
        <Circle
          x={pointA.x}
          y={pointA.y}
          radius={VERTEX_RADIUS}
          fill={GRAY_600}
          listening={false}
        />
      </>
    );
  }

  if (phase === "setCurvature" && pointB && controlPoint) {
    return (
      <>
        <Shape
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.moveTo(pointA.x, pointA.y);
            ctx.quadraticCurveTo(
              controlPoint.x,
              controlPoint.y,
              pointB.x,
              pointB.y,
            );
            ctx.fillStrokeShape(shape);
          }}
          {...linePreviewStyle}
        />
        <Circle
          x={pointA.x}
          y={pointA.y}
          radius={VERTEX_RADIUS}
          fill={GRAY_600}
          listening={false}
        />
        <Circle
          x={pointB.x}
          y={pointB.y}
          radius={VERTEX_RADIUS}
          fill={GRAY_600}
          listening={false}
        />
        <Circle
          x={controlPoint.x}
          y={controlPoint.y}
          radius={3}
          fill={BRAND}
          listening={false}
        />
      </>
    );
  }

  return null;
}

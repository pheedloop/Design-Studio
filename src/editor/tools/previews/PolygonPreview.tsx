import { Line, Circle } from "react-konva";
import type { PolygonToolState } from "@/editor/tools/hooks/usePolygonInteraction";

const linePreviewStyle = {
  stroke: "#475569",
  strokeWidth: 2,
  dash: [4, 4] as number[],
  listening: false,
  lineCap: "round" as const,
} as const;

const VERTEX_RADIUS = 4;

interface PolygonPreviewProps {
  state: PolygonToolState;
  scale: number;
}

export function PolygonPreview({ state }: PolygonPreviewProps) {
  const { vertices, previewPoint, isDrawing } = state;
  if (!isDrawing || vertices.length === 0) return null;

  const first = vertices[0];
  const last = vertices[vertices.length - 1];

  const placedPoints: number[] = [];
  for (const v of vertices) {
    placedPoints.push(v.x, v.y);
  }

  // Check if mouse is near first vertex (snap-to-close indicator)
  let nearFirst = false;
  if (previewPoint && vertices.length >= 3) {
    const dx = previewPoint.x - first.x;
    const dy = previewPoint.y - first.y;
    nearFirst = Math.sqrt(dx * dx + dy * dy) < 12;
  }

  return (
    <>
      {/* Placed edges */}
      {vertices.length >= 2 && (
        <Line points={placedPoints} {...linePreviewStyle} />
      )}
      {/* Next edge preview: last vertex to mouse */}
      {previewPoint && (
        <Line
          points={[last.x, last.y, previewPoint.x, previewPoint.y]}
          {...linePreviewStyle}
        />
      )}
      {/* Closing edge preview: mouse back to first vertex */}
      {previewPoint && vertices.length >= 2 && (
        <Line
          points={[previewPoint.x, previewPoint.y, first.x, first.y]}
          stroke="#475569"
          strokeWidth={1}
          dash={[3, 5]}
          opacity={0.5}
          listening={false}
        />
      )}
      {/* Vertex dots */}
      {vertices.map((v, i) => (
        <Circle
          key={i}
          x={v.x}
          y={v.y}
          radius={i === 0 && nearFirst ? 6 : VERTEX_RADIUS}
          fill={i === 0 && nearFirst ? "#007bff" : "#475569"}
          listening={false}
        />
      ))}
    </>
  );
}

import { Circle } from "react-konva";
import type Konva from "konva";
import type {
  FloorPlanElement,
  Geometry,
  PolygonGeometry,
} from "../../../types";

interface PolygonVertexHandlesProps {
  element: FloorPlanElement;
  onGeometryUpdate: (id: string, updates: Partial<Geometry>) => void;
}

const HANDLE_RADIUS = 5;

export function PolygonVertexHandles({
  element,
  onGeometryUpdate,
}: PolygonVertexHandlesProps) {
  const geometry = element.geometry as PolygonGeometry;

  const vertices: Array<{ x: number; y: number; index: number }> = [];
  for (let i = 0; i < geometry.points.length; i += 2) {
    vertices.push({
      x: geometry.x + geometry.points[i],
      y: geometry.y + geometry.points[i + 1],
      index: i / 2,
    });
  }

  const handleDrag = (
    vertexIndex: number,
    e: Konva.KonvaEventObject<DragEvent>,
  ) => {
    e.cancelBubble = true;
    const newPoints = [...geometry.points];
    newPoints[vertexIndex * 2] = e.target.x() - geometry.x;
    newPoints[vertexIndex * 2 + 1] = e.target.y() - geometry.y;
    onGeometryUpdate(element.id, { points: newPoints });
  };

  return (
    <>
      {vertices.map(v => (
        <Circle
          key={v.index}
          x={v.x}
          y={v.y}
          radius={HANDLE_RADIUS}
          fill="#fff"
          stroke="#007bff"
          strokeWidth={1.5}
          draggable
          onDragMove={e => handleDrag(v.index, e)}
        />
      ))}
    </>
  );
}

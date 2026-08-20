import { Circle } from "react-konva";
import type Konva from "konva";
import type { FloorPlanElement, Geometry, ArcGeometry } from "@/types";

interface ArcControlHandleProps {
  element: FloorPlanElement;
  onGeometryUpdate: (id: string, updates: Partial<Geometry>) => void;
}

const HANDLE_RADIUS = 5;
const CONTROL_HANDLE_RADIUS = 4;

export function ArcControlHandle({
  element,
  onGeometryUpdate,
}: ArcControlHandleProps) {
  const geometry = element.geometry as ArcGeometry;
  const [x1, y1, cx, cy, x2, y2] = geometry.points;

  const absStart = { x: geometry.x + x1, y: geometry.y + y1 };
  const absControl = { x: geometry.x + cx, y: geometry.y + cy };
  const absEnd = { x: geometry.x + x2, y: geometry.y + y2 };

  const handleDrag = (
    pointIndex: 0 | 1 | 2,
    e: Konva.KonvaEventObject<DragEvent>,
  ) => {
    e.cancelBubble = true;
    const newPoints = [...geometry.points] as [
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    const pos = { x: e.target.x(), y: e.target.y() };

    if (pointIndex === 0) {
      newPoints[0] = pos.x - geometry.x;
      newPoints[1] = pos.y - geometry.y;
    } else if (pointIndex === 1) {
      newPoints[4] = pos.x - geometry.x;
      newPoints[5] = pos.y - geometry.y;
    } else {
      newPoints[2] = pos.x - geometry.x;
      newPoints[3] = pos.y - geometry.y;
    }
    onGeometryUpdate(element.id, { points: newPoints });
  };

  return (
    <>
      <Circle
        x={absStart.x}
        y={absStart.y}
        radius={HANDLE_RADIUS}
        fill="#fff"
        stroke="#007bff"
        strokeWidth={1.5}
        draggable
        onDragMove={e => handleDrag(0, e)}
      />
      <Circle
        x={absEnd.x}
        y={absEnd.y}
        radius={HANDLE_RADIUS}
        fill="#fff"
        stroke="#007bff"
        strokeWidth={1.5}
        draggable
        onDragMove={e => handleDrag(1, e)}
      />
      <Circle
        x={absControl.x}
        y={absControl.y}
        radius={CONTROL_HANDLE_RADIUS}
        fill="#007bff"
        stroke="#fff"
        strokeWidth={1.5}
        draggable
        onDragMove={e => handleDrag(2, e)}
      />
    </>
  );
}

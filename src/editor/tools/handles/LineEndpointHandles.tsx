import { Circle } from "react-konva";
import type Konva from "konva";
import type { FloorPlanElement, Geometry, LineGeometry } from "../../../types";
import { snapToAngle } from "../../utils/canvas";

interface LineEndpointHandlesProps {
  element: FloorPlanElement;
  onGeometryUpdate: (id: string, updates: Partial<Geometry>) => void;
}

const HANDLE_RADIUS = 5;

export function LineEndpointHandles({
  element,
  onGeometryUpdate,
}: LineEndpointHandlesProps) {
  const geometry = element.geometry as LineGeometry;
  const [x1, y1, x2, y2] = geometry.points;

  const abs1 = { x: geometry.x + x1, y: geometry.y + y1 };
  const abs2 = { x: geometry.x + x2, y: geometry.y + y2 };

  const handleDrag = (
    pointIndex: 0 | 1,
    e: Konva.KonvaEventObject<DragEvent>,
  ) => {
    e.cancelBubble = true;

    let pos = { x: e.target.x(), y: e.target.y() };

    if (e.evt.shiftKey) {
      const anchor = pointIndex === 0 ? abs2 : abs1;
      pos = snapToAngle(anchor, pos);
      e.target.x(pos.x);
      e.target.y(pos.y);
    }

    const newPoints = [...geometry.points] as [number, number, number, number];
    if (pointIndex === 0) {
      newPoints[0] = pos.x - geometry.x;
      newPoints[1] = pos.y - geometry.y;
    } else {
      newPoints[2] = pos.x - geometry.x;
      newPoints[3] = pos.y - geometry.y;
    }
    onGeometryUpdate(element.id, { points: newPoints });
  };

  return (
    <>
      <Circle
        x={abs1.x}
        y={abs1.y}
        radius={HANDLE_RADIUS}
        fill="#fff"
        stroke="#007bff"
        strokeWidth={1.5}
        draggable
        onDragMove={e => handleDrag(0, e)}
      />
      <Circle
        x={abs2.x}
        y={abs2.y}
        radius={HANDLE_RADIUS}
        fill="#fff"
        stroke="#007bff"
        strokeWidth={1.5}
        draggable
        onDragMove={e => handleDrag(1, e)}
      />
    </>
  );
}

import { useRef, useEffect, useCallback, useMemo } from "react";
import { Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { FloorPlanElement, Geometry } from "../../../types";
import { getElementBounds } from "../../utils/bounds";

interface GroupTransformerProps {
  groupId: string;
  memberElements: FloorPlanElement[];
  onGroupTransformEnd: (
    updates: Array<{ id: string; geometry: Partial<Geometry> }>,
  ) => void;
}

export function GroupTransformer({
  groupId,
  memberElements,
  onGroupTransformEnd,
}: GroupTransformerProps) {
  const trRef = useRef<Konva.Transformer>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const origDataRef = useRef<{
    bounds: { x: number; y: number; width: number; height: number };
    geometries: Map<string, Geometry>;
  } | null>(null);

  const bounds = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const el of memberElements) {
      const b = getElementBounds(el);
      minX = Math.min(minX, b.left);
      minY = Math.min(minY, b.top);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
    }
    if (!isFinite(minX)) return { x: 0, y: 0, width: 0, height: 0 };
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [memberElements]);

  // Attach transformer to the virtual rect; re-attach when group changes
  useEffect(() => {
    const tr = trRef.current;
    const rect = rectRef.current;
    if (!tr || !rect) return;
    tr.nodes([rect]);
    tr.getLayer()?.batchDraw();
  }, [groupId]);

  // Keep transformer in sync when bounds change (e.g. after a move)
  useEffect(() => {
    trRef.current?.getLayer()?.batchDraw();
  }, [bounds]);

  const handleTransformStart = useCallback(() => {
    origDataRef.current = {
      bounds: { ...bounds },
      geometries: new Map(memberElements.map(el => [el.id, el.geometry])),
    };
  }, [bounds, memberElements]);

  const handleTransformEnd = useCallback(() => {
    const rect = rectRef.current;
    if (!rect || !origDataRef.current) return;

    const { bounds: orig, geometries: origGeoms } = origDataRef.current;
    const newWidth = rect.width() * rect.scaleX();
    const newHeight = rect.height() * rect.scaleY();
    const newX = rect.x();
    const newY = rect.y();

    // Reset scale so it doesn't compound
    rect.scaleX(1);
    rect.scaleY(1);
    rect.width(newWidth);
    rect.height(newHeight);

    if (orig.width === 0 || orig.height === 0) return;
    const scaleX = newWidth / orig.width;
    const scaleY = newHeight / orig.height;

    const updates = memberElements.map(el => ({
      id: el.id,
      geometry: scaleGeometry(
        origGeoms.get(el.id)!,
        orig,
        newX,
        newY,
        scaleX,
        scaleY,
      ),
    }));

    onGroupTransformEnd(updates);
  }, [memberElements, onGroupTransformEnd]);

  return (
    <>
      <Rect
        ref={rectRef}
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        fill="rgba(0,0,0,0)"
        stroke="transparent"
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
      />
      <Transformer
        ref={trRef}
        rotateEnabled={false}
        borderStroke="#007bff"
        borderStrokeWidth={1.5}
        anchorFill="#fff"
        anchorStroke="#007bff"
        anchorSize={8}
        anchorCornerRadius={2}
        boundBoxFunc={(_oldBox, newBox) => {
          if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10)
            return _oldBox;
          return newBox;
        }}
      />
    </>
  );
}

function scaleGeometry(
  geo: Geometry,
  orig: { x: number; y: number; width: number; height: number },
  newX: number,
  newY: number,
  scaleX: number,
  scaleY: number,
): Partial<Geometry> {
  const gx = newX + (geo.x - orig.x) * scaleX;
  const gy = newY + (geo.y - orig.y) * scaleY;

  if (geo.shape === "rect") {
    return {
      x: gx,
      y: gy,
      width: geo.width * scaleX,
      height: geo.height * scaleY,
    };
  }
  if (geo.shape === "ellipse") {
    return {
      x: gx,
      y: gy,
      radiusX: geo.radiusX * scaleX,
      radiusY: geo.radiusY * scaleY,
    };
  }
  if (geo.shape === "circle") {
    return { x: gx, y: gy, radius: geo.radius * Math.min(scaleX, scaleY) };
  }
  if (geo.shape === "line" || geo.shape === "arrow") {
    return {
      x: gx,
      y: gy,
      points: [
        geo.points[0] * scaleX,
        geo.points[1] * scaleY,
        geo.points[2] * scaleX,
        geo.points[3] * scaleY,
      ] as [number, number, number, number],
    };
  }
  if (geo.shape === "arc") {
    return {
      x: gx,
      y: gy,
      points: [
        geo.points[0] * scaleX,
        geo.points[1] * scaleY,
        geo.points[2] * scaleX,
        geo.points[3] * scaleY,
        geo.points[4] * scaleX,
        geo.points[5] * scaleY,
      ] as [number, number, number, number, number, number],
    };
  }
  if (geo.shape === "polygon") {
    return {
      x: gx,
      y: gy,
      points: geo.points.map((v, i) => (i % 2 === 0 ? v * scaleX : v * scaleY)),
    };
  }
  return { x: gx, y: gy };
}

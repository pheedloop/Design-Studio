import { useRef, useEffect, useCallback, useMemo } from "react";
import { Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { FloorPlanElement, Geometry } from "@/types";
import { scaleGeometry } from "@/editor/utils/scaleGeometry";
import { getElementBounds } from "@/editor/utils/bounds";
import { BRAND, WHITE } from "@/canvasColors";

interface MultiSelectTransformerProps {
  elements: FloorPlanElement[];
  onTransformEnd: (
    updates: Array<{ id: string; geometry: Partial<Geometry> }>,
  ) => void;
}

export function MultiSelectTransformer({
  elements,
  onTransformEnd,
}: MultiSelectTransformerProps) {
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
    for (const el of elements) {
      const b = getElementBounds(el);
      minX = Math.min(minX, b.left);
      minY = Math.min(minY, b.top);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
    }
    if (!isFinite(minX)) return { x: 0, y: 0, width: 0, height: 0 };
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [elements]);

  // Attach once: the parent remounts this for a new selection.
  useEffect(() => {
    const tr = trRef.current;
    const rect = rectRef.current;
    if (!tr || !rect) return;
    tr.nodes([rect]);
    tr.getLayer()?.batchDraw();
  }, []);

  // Keep transformer in sync when bounds change (e.g. after a move)
  useEffect(() => {
    trRef.current?.getLayer()?.batchDraw();
  }, [bounds]);

  const handleTransformStart = useCallback(() => {
    origDataRef.current = {
      bounds: { ...bounds },
      geometries: new Map(elements.map(el => [el.id, el.geometry])),
    };
  }, [bounds, elements]);

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
    const to = { x: newX, y: newY, width: newWidth, height: newHeight };
    const updates = elements.map(el => ({
      id: el.id,
      geometry: scaleGeometry(origGeoms.get(el.id)!, orig, to),
    }));

    onTransformEnd(updates);
  }, [elements, onTransformEnd]);

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
        // Presses fall through to the elements, which drag the selection.
        listening={false}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
      />
      <Transformer
        ref={trRef}
        rotateEnabled={false}
        flipEnabled={false}
        borderStroke={BRAND}
        borderStrokeWidth={1.5}
        anchorFill={WHITE}
        anchorStroke={BRAND}
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

import { useEffect, useRef } from "react";
import { Group, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { CropRect } from "@/editor/hooks/useCrop";

interface CropOverlayProps {
  rect: CropRect;
  canvasWidth: number;
  canvasHeight: number;
  onChange: (rect: CropRect) => void;
}

const DIM = "rgba(0,0,0,0.4)";

/** Interactive crop rectangle drawn over the canvas: a draggable/resizable box
 *  (Konva Transformer, no rotate) with a dimmed mask over everything outside
 *  it. Emits the new rect on drag/resize end. */
export function CropOverlay({
  rect,
  canvasWidth,
  canvasHeight,
  onChange,
}: CropOverlayProps) {
  const rectRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (trRef.current && rectRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, []);

  const commit = () => {
    const node = rectRef.current;
    if (!node) return;
    const width = Math.max(1, node.width() * node.scaleX());
    const height = Math.max(1, node.height() * node.scaleY());
    node.scaleX(1);
    node.scaleY(1);
    onChange({ x: node.x(), y: node.y(), width, height });
  };

  const rightW = Math.max(0, canvasWidth - rect.x - rect.width);
  const bottomH = Math.max(0, canvasHeight - rect.y - rect.height);

  return (
    <Group>
      {/* Dim mask over everything outside the crop rectangle. */}
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={rect.y}
        fill={DIM}
        listening={false}
      />
      <Rect
        x={0}
        y={rect.y + rect.height}
        width={canvasWidth}
        height={bottomH}
        fill={DIM}
        listening={false}
      />
      <Rect
        x={0}
        y={rect.y}
        width={rect.x}
        height={rect.height}
        fill={DIM}
        listening={false}
      />
      <Rect
        x={rect.x + rect.width}
        y={rect.y}
        width={rightW}
        height={rect.height}
        fill={DIM}
        listening={false}
      />

      <Rect
        ref={rectRef}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        stroke="#2563eb"
        strokeWidth={2}
        strokeScaleEnabled={false}
        dash={[6, 4]}
        // Near-transparent fill so the whole box is draggable, not just the edge.
        fill="rgba(37,99,235,0.001)"
        draggable
        onDragEnd={commit}
        onTransformEnd={commit}
      />
      <Transformer
        ref={trRef}
        rotateEnabled={false}
        flipEnabled={false}
        ignoreStroke
        boundBoxFunc={(oldBox, newBox) =>
          newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
        }
      />
    </Group>
  );
}

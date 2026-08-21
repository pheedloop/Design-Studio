import { Group } from "react-konva";
import type Konva from "konva";
import type { BadgeField } from "./model";
import type { BadgeData } from "./badgeData";
import { fieldSizePx } from "./useBadgeGuides";
import { PPI, QR_BASE_PX } from "./canvasMetrics";
import { FieldBody } from "./FieldBody";

interface FieldShapeProps {
  field: BadgeField;
  data: BadgeData | null;
  panMode: boolean;
  registerRef: (node: Konva.Group | null) => void;
  onMouseDown: (additive: boolean) => void;
  onChange: (patch: Partial<BadgeField>) => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragFinish: () => void;
}

export function FieldShape({
  field,
  data,
  panMode,
  registerRef,
  onMouseDown,
  onChange,
  onDragStart,
  onDragMove,
  onDragFinish,
}: FieldShapeProps) {
  const x = field.left * PPI;
  const y = field.top * PPI;

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (panMode) return; // let the event bubble so the stage pans
    e.cancelBubble = true; // don't start a marquee
    onMouseDown(e.evt.shiftKey);
  };
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ left: e.target.x() / PPI, top: e.target.y() / PPI });
    onDragFinish();
  };

  const { w, h } = fieldSizePx(field);
  const isQrField = field.kind === "qrCode";

  return (
    <Group
      ref={registerRef}
      x={x}
      y={y}
      width={w}
      height={h}
      draggable={!panMode}
      onMouseDown={handleMouseDown}
      onDragStart={onDragStart}
      onDragMove={e => onDragMove(e.target)}
      onDragEnd={handleDragEnd}
      onTransformEnd={e => {
        const node = e.target;
        if (isQrField) {
          const newSize = node.width() * node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({ scale: newSize / QR_BASE_PX });
        } else {
          const newW = node.width() * node.scaleX();
          const newH = node.height() * node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            width: newW / PPI,
            height: newH / PPI,
            numLines: Math.max(1, Math.floor(newH / (field.fontSize ?? 20))),
          });
        }
      }}
    >
      <FieldBody field={field} data={data} />
    </Group>
  );
}

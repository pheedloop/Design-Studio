import { Rect } from "react-konva";
import { BRAND } from "@/canvasColors";

interface SelectionRectProps {
  rect: { x: number; y: number; width: number; height: number } | null;
}

export function SelectionRect({ rect }: SelectionRectProps) {
  if (!rect) return null;

  return (
    <Rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill="rgba(0, 123, 255, 0.08)"
      stroke={BRAND}
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  );
}

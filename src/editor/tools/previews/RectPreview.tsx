import { Rect } from "react-konva";
import type { DrawingRect } from "@/editor/tools/hooks/useClickDragInteraction";
import { GRAY_400, GRAY_600 } from "@/canvasColors";

const previewStyle = {
  fill: GRAY_400,
  opacity: 0.5,
  stroke: GRAY_600,
  strokeWidth: 1,
  dash: [4, 4] as number[],
  listening: false,
} as const;

interface RectPreviewProps {
  state: DrawingRect | null;
  scale: number;
}

export function RectPreview({ state }: RectPreviewProps) {
  if (!state) return null;

  return (
    <Rect
      x={state.x}
      y={state.y}
      width={state.width}
      height={state.height}
      {...previewStyle}
    />
  );
}

import { Rect } from "react-konva";
import type { DrawingRect } from "@/editor/tools/hooks/useClickDragInteraction";

const previewStyle = {
  fill: "#94a3b8",
  opacity: 0.5,
  stroke: "#475569",
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

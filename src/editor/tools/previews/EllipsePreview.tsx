import { Ellipse } from "react-konva";
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

interface EllipsePreviewProps {
  state: DrawingRect | null;
  scale: number;
}

export function EllipsePreview({ state }: EllipsePreviewProps) {
  if (!state) return null;

  return (
    <Ellipse
      x={state.x + state.width / 2}
      y={state.y + state.height / 2}
      radiusX={state.width / 2}
      radiusY={state.height / 2}
      {...previewStyle}
    />
  );
}

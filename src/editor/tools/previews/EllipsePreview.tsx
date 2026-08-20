import { Ellipse } from "react-konva";
import type { DrawingRect } from "@/editor/tools/hooks/useClickDragInteraction";

const previewStyle = {
  fill: "#94a3b8",
  opacity: 0.5,
  stroke: "#475569",
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

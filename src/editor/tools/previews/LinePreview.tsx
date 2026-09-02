import { Line } from "react-konva";
import type { LinePreviewState } from "@/editor/tools/hooks/useLineInteraction";
import { GRAY_600 } from "@/canvasColors";

const previewStyle = {
  stroke: GRAY_600,
  strokeWidth: 2,
  dash: [4, 4] as number[],
  listening: false,
  lineCap: "round" as const,
} as const;

interface LinePreviewProps {
  state: LinePreviewState | null;
  scale: number;
}

export function LinePreview({ state }: LinePreviewProps) {
  if (!state) return null;

  return (
    <Line points={[state.x1, state.y1, state.x2, state.y2]} {...previewStyle} />
  );
}

import { useState, useRef, useCallback } from "react";
import type Konva from "konva";
import type { ToolContext, ToolInteraction, ToolResult } from "../types";
import {
  getCanvasPoint,
  isEmptySpaceClick,
  snapToAngle,
} from "../../utils/canvas";

export interface LinePreviewState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const MIN_LENGTH = 5;

/**
 * Shared interaction hook for line-based tools (line, arrow).
 * Click sets origin, drag updates endpoint, release completes.
 */
export function useLineInteraction(
  ctx: ToolContext,
  createResult: (line: LinePreviewState, ctx: ToolContext) => ToolResult,
): ToolInteraction<LinePreviewState | null> {
  const [preview, setPreview] = useState<LinePreviewState | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isEmptySpaceClick(e)) return;

      const stage = ctx.stageRef.current;
      if (!stage) return;

      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      origin.current = point;
      setPreview({ x1: point.x, y1: point.y, x2: point.x, y2: point.y });
    },
    [ctx.stageRef, ctx.position, ctx.scale],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!origin.current) return;

      const stage = ctx.stageRef.current;
      if (!stage) return;

      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      const end = e.evt.shiftKey ? snapToAngle(origin.current, point) : point;

      setPreview({
        x1: origin.current.x,
        y1: origin.current.y,
        x2: end.x,
        y2: end.y,
      });
    },
    [ctx.stageRef, ctx.position, ctx.scale],
  );

  const handleMouseUp = useCallback(() => {
    if (!preview || !origin.current) return;

    const dx = preview.x2 - preview.x1;
    const dy = preview.y2 - preview.y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length > MIN_LENGTH) {
      const result = createResult(preview, ctx);
      ctx.onComplete(result);
    }

    origin.current = null;
    setPreview(null);
  }, [preview, ctx, createResult]);

  const cancel = useCallback(() => {
    origin.current = null;
    setPreview(null);
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    cancel,
    cursor: "crosshair",
    state: preview,
  };
}

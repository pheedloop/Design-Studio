import { useState, useRef, useCallback } from "react";
import type Konva from "konva";
import type { ToolContext, ToolInteraction, ToolResult } from "../types";
import { getCanvasPoint, isEmptySpaceClick } from "../../utils/canvas";

export interface DrawingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_SIZE = 5;

/**
 * Shared interaction hook for click-drag tools (rectangle, ellipse, booth).
 * Mouse down sets the origin, mouse move updates the preview rect,
 * mouse up calls createResult to build the ToolResult, then onComplete.
 *
 * @param ctx      Standard tool context from MapEditor
 * @param createResult  Transforms raw rect + defaults into a ToolResult
 */
export function useClickDragInteraction(
  ctx: ToolContext,
  createResult: (rect: DrawingRect, ctx: ToolContext) => ToolResult,
): ToolInteraction<DrawingRect | null> {
  const [preview, setPreview] = useState<DrawingRect | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isEmptySpaceClick(e)) return;

      const stage = ctx.stageRef.current;
      if (!stage) return;

      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      origin.current = point;
      setPreview({ x: point.x, y: point.y, width: 0, height: 0 });
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

      const o = origin.current;
      let width = Math.abs(point.x - o.x);
      let height = Math.abs(point.y - o.y);

      // Shift constrains to square/circle
      if (e.evt.shiftKey) {
        const size = Math.max(width, height);
        width = size;
        height = size;
      }

      setPreview({
        x: point.x < o.x ? o.x - width : o.x,
        y: point.y < o.y ? o.y - height : o.y,
        width,
        height,
      });
    },
    [ctx.stageRef, ctx.position, ctx.scale],
  );

  const handleMouseUp = useCallback(() => {
    if (!preview || !origin.current) return;

    if (preview.width > MIN_SIZE && preview.height > MIN_SIZE) {
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

import { useCallback } from "react";
import type Konva from "konva";
import type {
  ToolContext,
  ToolInteraction,
  ToolResult,
} from "@/editor/tools/types";
import { getCanvasPoint, isEmptySpaceClick } from "@/editor/utils/canvas";

/**
 * Single-click placement interaction for tools like text and icon.
 * Clicks on empty space to place an element at that point.
 */
export function useClickPlaceInteraction(
  ctx: ToolContext,
  createResult: (
    point: { x: number; y: number },
    ctx: ToolContext,
  ) => ToolResult,
): ToolInteraction<null> {
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isEmptySpaceClick(e)) return;

      const stage = ctx.stageRef.current;
      if (!stage) return;

      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      const result = createResult(point, ctx);
      ctx.onComplete(result);
    },
    [ctx, createResult],
  );

  return {
    handleMouseDown,
    handleMouseMove: () => {},
    handleMouseUp: () => {},
    cursor: "crosshair",
    state: null,
  };
}

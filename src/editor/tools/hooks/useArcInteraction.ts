import { useState, useCallback, useRef, useLayoutEffect } from "react";
import type Konva from "konva";
import type { ToolContext, ToolInteraction, ToolResult } from "../types";
import { getCanvasPoint, isEmptySpaceClick } from "../../utils/canvas";

export type ArcToolPhase = "idle" | "pickEnd" | "setCurvature";

export interface ArcToolState {
  phase: ArcToolPhase;
  pointA: { x: number; y: number } | null;
  pointB: { x: number; y: number } | null;
  controlPoint: { x: number; y: number } | null;
}

const INITIAL_STATE: ArcToolState = {
  phase: "idle",
  pointA: null,
  pointB: null,
  controlPoint: null,
};

/**
 * Multi-phase arc interaction: pick start → pick end → set curvature → complete.
 */
export function useArcInteraction(
  ctx: ToolContext,
  createResult: (
    arc: { x1: number; y1: number; cx: number; cy: number; x2: number; y2: number },
    ctx: ToolContext
  ) => ToolResult
): ToolInteraction<ArcToolState> {
  const [state, setState] = useState<ArcToolState>(INITIAL_STATE);
  const stateRef = useRef(state);
  // Mirror state into a ref so event handlers (useCallback'd, so they'd
  // otherwise close over a stale `state`) can read the latest value. Synced in
  // an effect, not during render — refs must not be written while rendering.
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  const cancel = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isEmptySpaceClick(e)) return;

      const stage = ctx.stageRef.current;
      if (!stage) return;
      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      const current = stateRef.current;

      if (current.phase === "idle") {
        setState({
          phase: "pickEnd",
          pointA: point,
          pointB: null,
          controlPoint: null,
        });
      } else if (current.phase === "pickEnd") {
        const mid = {
          x: (current.pointA!.x + point.x) / 2,
          y: (current.pointA!.y + point.y) / 2,
        };
        setState({
          phase: "setCurvature",
          pointA: current.pointA,
          pointB: point,
          controlPoint: mid,
        });
      } else if (current.phase === "setCurvature") {
        const result = createResult(
          {
            x1: current.pointA!.x,
            y1: current.pointA!.y,
            cx: current.controlPoint!.x,
            cy: current.controlPoint!.y,
            x2: current.pointB!.x,
            y2: current.pointB!.y,
          },
          ctx
        );
        ctx.onComplete(result);
        setState(INITIAL_STATE);
      }
    },
    [ctx, createResult]
  );

  const handleMouseMove = useCallback(
    () => {
      const stage = ctx.stageRef.current;
      if (!stage) return;
      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      const current = stateRef.current;

      if (current.phase === "pickEnd" && current.pointA) {
        setState((prev) => ({ ...prev, pointB: point }));
      } else if (current.phase === "setCurvature" && current.pointA && current.pointB) {
        const a = current.pointA;
        const b = current.pointB;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const chordLen = Math.sqrt(dx * dx + dy * dy);

        if (chordLen < 1) {
          setState((prev) => ({ ...prev, controlPoint: point }));
          return;
        }

        const perpX = -dy / chordLen;
        const perpY = dx / chordLen;
        const mx = point.x - mid.x;
        const my = point.y - mid.y;
        const projLen = mx * perpX + my * perpY;

        setState((prev) => ({
          ...prev,
          controlPoint: {
            x: mid.x + perpX * projLen,
            y: mid.y + perpY * projLen,
          },
        }));
      }
    },
    [ctx.stageRef, ctx.position, ctx.scale]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancel();
      }
    },
    [cancel]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: () => {},
    handleKeyDown,
    cancel,
    cursor: "crosshair",
    state,
  };
}

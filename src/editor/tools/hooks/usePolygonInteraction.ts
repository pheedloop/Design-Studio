import { useState, useCallback, useRef, useLayoutEffect } from "react";
import type Konva from "konva";
import type { ToolContext, ToolInteraction, ToolResult } from "../types";
import {
  getCanvasPoint,
  isEmptySpaceClick,
  snapToAngle,
} from "../../utils/canvas";

export interface PolygonToolState {
  vertices: Array<{ x: number; y: number }>;
  previewPoint: { x: number; y: number } | null;
  isDrawing: boolean;
}

const INITIAL_STATE: PolygonToolState = {
  vertices: [],
  previewPoint: null,
  isDrawing: false,
};

const SNAP_CLOSE_DISTANCE = 8;
const MIN_VERTICES = 3;

/**
 * Multi-click polygon interaction: click to add vertices, double-click or snap-to-first to close.
 */
export function usePolygonInteraction(
  ctx: ToolContext,
  createResult: (
    polygon: { points: number[]; anchorX: number; anchorY: number },
    ctx: ToolContext,
  ) => ToolResult,
): ToolInteraction<PolygonToolState> {
  const [state, setState] = useState<PolygonToolState>(INITIAL_STATE);
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

  const closePolygon = useCallback(() => {
    const { vertices } = stateRef.current;
    if (vertices.length < MIN_VERTICES) return;

    const anchorX = vertices[0].x;
    const anchorY = vertices[0].y;
    const flatPoints: number[] = [];
    for (const v of vertices) {
      flatPoints.push(v.x - anchorX, v.y - anchorY);
    }
    const result = createResult({ points: flatPoints, anchorX, anchorY }, ctx);
    ctx.onComplete(result);
    setState(INITIAL_STATE);
  }, [ctx, createResult]);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isEmptySpaceClick(e)) return;

      const stage = ctx.stageRef.current;
      if (!stage) return;
      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      const current = stateRef.current;

      let finalPoint = point;
      if (e.evt.shiftKey && current.vertices.length > 0) {
        const lastVertex = current.vertices[current.vertices.length - 1];
        finalPoint = snapToAngle(lastVertex, point);
      }

      // Snap-to-close
      if (current.vertices.length >= MIN_VERTICES) {
        const first = current.vertices[0];
        const dx = finalPoint.x - first.x;
        const dy = finalPoint.y - first.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SNAP_CLOSE_DISTANCE / ctx.scale) {
          closePolygon();
          return;
        }
      }

      setState(prev => ({
        vertices: [...prev.vertices, finalPoint],
        previewPoint: finalPoint,
        isDrawing: true,
      }));
    },
    [ctx, closePolygon],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!stateRef.current.isDrawing) return;

      const stage = ctx.stageRef.current;
      if (!stage) return;
      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      let finalPoint = point;
      const current = stateRef.current;
      if (e.evt.shiftKey && current.vertices.length > 0) {
        const lastVertex = current.vertices[current.vertices.length - 1];
        finalPoint = snapToAngle(lastVertex, point);
      }

      setState(prev => ({ ...prev, previewPoint: finalPoint }));
    },
    [ctx.stageRef, ctx.position, ctx.scale],
  );

  const handleDoubleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isEmptySpaceClick(e)) return;
      setState(prev => ({
        ...prev,
        vertices: prev.vertices.slice(0, -1),
      }));
      setTimeout(() => closePolygon(), 0);
    },
    [closePolygon],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancel();
      } else if (e.key === "Enter") {
        closePolygon();
      }
    },
    [cancel, closePolygon],
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: () => {},
    handleDoubleClick,
    handleKeyDown,
    cancel,
    cursor: "crosshair",
    state,
  };
}

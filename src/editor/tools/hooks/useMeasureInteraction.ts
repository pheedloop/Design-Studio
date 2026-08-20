import { useState, useCallback, useRef } from "react";
import type Konva from "konva";
import type { Point } from "../../../types";
import type { ToolContext, ToolInteraction } from "../types";
import { getCanvasPoint, snapToAngle } from "../../utils/canvas";

export interface MeasureState {
  p1: Point | null;
  p2: Point | null;
  measuring: boolean;
}

const INITIAL_STATE: MeasureState = {
  p1: null,
  p2: null,
  measuring: false,
};

/**
 * Measure tool interaction: click-drag to measure distance.
 * Does not create elements — the preview IS the output.
 */
export function useMeasureInteraction(
  ctx: ToolContext,
): ToolInteraction<MeasureState> {
  const [state, setState] = useState<MeasureState>(INITIAL_STATE);
  const measuringRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = ctx.stageRef.current;
      if (!stage) return;
      const point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      e.evt.preventDefault();
      measuringRef.current = true;
      setState({ p1: point, p2: point, measuring: true });
    },
    [ctx.stageRef, ctx.position, ctx.scale],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!measuringRef.current) return;
      const stage = ctx.stageRef.current;
      if (!stage) return;
      let point = getCanvasPoint(stage, ctx.position, ctx.scale);
      if (!point) return;

      setState(prev => {
        if (!prev.p1 || !prev.measuring) return prev;
        if (e.evt.shiftKey) {
          point = snapToAngle(prev.p1, point!);
        }
        return { ...prev, p2: point };
      });
    },
    [ctx.stageRef, ctx.position, ctx.scale],
  );

  const handleMouseUp = useCallback(() => {
    measuringRef.current = false;
    setState(prev => ({ ...prev, measuring: false }));
  }, []);

  const cancel = useCallback(() => {
    measuringRef.current = false;
    setState(INITIAL_STATE);
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    cancel,
    cursor: "crosshair",
    state,
  };
}

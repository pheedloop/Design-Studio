import { useState, useCallback, useEffect, useRef } from "react";
import type Konva from "konva";
import type { Point, ScaleCalibration, Unit } from "@/types";
import { getCanvasPoint, snapToAngle } from "@/editor/utils/canvas";

export type CalibrationStep = "idle" | "pickingP1" | "pickingP2" | "confirming";

export interface CalibrationState {
  step: CalibrationStep;
  p1: Point | null;
  p2: Point | null;
  mousePos: Point | null;
}

const INITIAL_STATE: CalibrationState = {
  step: "idle",
  p1: null,
  p2: null,
  mousePos: null,
};

interface UseCalibrationOptions {
  stageRef: React.RefObject<Konva.Stage | null>;
  position: { x: number; y: number };
  scale: number;
  isActive: boolean;
  onComplete: (cal: ScaleCalibration) => void;
}

export function useCalibration({
  stageRef,
  position,
  scale,
  isActive,
  onComplete,
}: UseCalibrationOptions) {
  const [state, setState] = useState<CalibrationState>(INITIAL_STATE);
  const mousePosRef = useRef<Point | null>(null);

  // Reset when deactivated. Every current caller already resets this hook's
  // state itself when it turns calibration off (see handleCancel/handleConfirm
  // below and MapEditor's handleCancelCalibration), so this is redundant
  // today — but it's the hook's own defensive guarantee for any future
  // caller that flips `isActive` off without also calling handleCancel.
  useEffect(() => {
    if (!isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(INITIAL_STATE);
      mousePosRef.current = null;
    }
  }, [isActive]);

  const start = useCallback(() => {
    setState({ ...INITIAL_STATE, step: "pickingP1" });
  }, []);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      let point = getCanvasPoint(stage, position, scale);
      if (!point) return;

      // Prevent stage drag during calibration
      e.evt.preventDefault();

      setState(prev => {
        if (prev.step === "pickingP1") {
          return { ...prev, step: "pickingP2", p1: point, mousePos: point };
        }
        if (prev.step === "pickingP2" && prev.p1) {
          // Shift-snap to horizontal/vertical/45°
          if (e.evt.shiftKey) {
            point = snapToAngle(prev.p1, point!);
          }
          return { ...prev, step: "confirming", p2: point, mousePos: null };
        }
        return prev;
      });
    },
    [stageRef, position, scale],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      let point = getCanvasPoint(stage, position, scale);
      if (!point) return;

      mousePosRef.current = point;
      setState(prev => {
        if (prev.step === "pickingP2" && prev.p1) {
          // Shift-snap preview to horizontal/vertical/45°
          if (e.evt.shiftKey) {
            point = snapToAngle(prev.p1, point!);
          }
          return { ...prev, mousePos: point };
        }
        return prev;
      });
    },
    [stageRef, position, scale],
  );

  const handleConfirm = useCallback(
    (distance: number, unit: Unit) => {
      if (!state.p1 || !state.p2 || distance <= 0) return;

      const cal: ScaleCalibration = {
        p1: state.p1,
        p2: state.p2,
        distance,
        unit,
      };
      onComplete(cal);
      setState(INITIAL_STATE);
    },
    [state.p1, state.p2, onComplete],
  );

  const handleCancel = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /** Pixel distance between p1 and p2 (or p1 and mouse). */
  const pixelDistance =
    state.p1 && state.p2
      ? Math.sqrt(
          (state.p2.x - state.p1.x) ** 2 + (state.p2.y - state.p1.y) ** 2,
        )
      : null;

  return {
    state,
    pixelDistance,
    start,
    handleMouseDown,
    handleMouseMove,
    handleConfirm,
    handleCancel,
  };
}

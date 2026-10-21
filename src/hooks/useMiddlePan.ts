import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";

type Vector = { x: number; y: number };

// Middle-button pan for a Stage, moved imperatively so a pan doesn't re-render
// per pixel. Each handler returns true when it consumed the event.
export function useMiddlePan(
  stageRef: React.RefObject<Konva.Stage | null>,
  onPositionChange: (pos: Vector) => void,
) {
  const [isMiddlePanning, setIsMiddlePanning] = useState(false);
  const start = useRef<{ pointer: Vector; stage: Vector } | null>(null);

  const end = useCallback(() => {
    if (!start.current) return;
    start.current = null;
    setIsMiddlePanning(false);
    const stage = stageRef.current;
    if (stage) onPositionChange(stage.position());
  }, [stageRef, onPositionChange]);

  // The button can be released outside the Stage.
  useEffect(() => {
    if (!isMiddlePanning) return;
    const onWindowMouseUp = (e: MouseEvent) => {
      if (e.button === 1) end();
    };
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [isMiddlePanning, end]);

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 1) return false;
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (stage) {
      start.current = {
        pointer: { x: e.evt.clientX, y: e.evt.clientY },
        stage: stage.position(),
      };
      setIsMiddlePanning(true);
    }
    return true;
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const s = start.current;
    if (!s) return false;
    stageRef.current?.position({
      x: s.stage.x + e.evt.clientX - s.pointer.x,
      y: s.stage.y + e.evt.clientY - s.pointer.y,
    });
    return true;
  };

  const onMouseUp = () => {
    if (!start.current) return false;
    end();
    return true;
  };

  // Some mice emit wheel deltas while the middle button is held; zooming then
  // would also read a stage position the pan hasn't synced yet.
  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    if (!start.current) return false;
    e.evt.preventDefault();
    return true;
  };

  return { isMiddlePanning, onMouseDown, onMouseMove, onMouseUp, onWheel };
}

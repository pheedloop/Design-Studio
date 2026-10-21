import { useRef } from "react";
import type Konva from "konva";

type KonvaDragEvent = Konva.KonvaEventObject<DragEvent>;

// Konva also drags on the middle button, and Konva.dragButtons is global to
// the host page, so a middle-button drag is refused per node; the middle
// button pans the canvas instead. stopDrag() fires dragend at once, so a node
// that commits on dragend needs useLeftButtonDrag.
export function refuseMiddleButtonDrag(e: KonvaDragEvent): boolean {
  // dragstart carries the original mousedown.
  if ((e.evt as MouseEvent | undefined)?.button !== 1) return false;
  e.target.stopDrag();
  return true;
}

export function useLeftButtonDrag(
  onDragStart: (e: KonvaDragEvent) => void,
  onDragEnd: (e: KonvaDragEvent) => void,
) {
  const refused = useRef(false);
  return {
    onDragStart: (e: KonvaDragEvent) => {
      refused.current = refuseMiddleButtonDrag(e);
      if (!refused.current) onDragStart(e);
    },
    // Nothing moved, so nothing to commit.
    onDragEnd: (e: KonvaDragEvent) => {
      if (refused.current) {
        refused.current = false;
        return;
      }
      onDragEnd(e);
    },
  };
}

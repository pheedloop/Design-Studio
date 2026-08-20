import type Konva from "konva";

/**
 * Convert screen pointer position to canvas coordinates,
 * accounting for pan (position) and zoom (scale).
 */
export function getCanvasPoint(
  stage: Konva.Stage,
  position: { x: number; y: number },
  scale: number,
): { x: number; y: number } | null {
  const pointer = stage.getPointerPosition();
  if (!pointer) return null;
  return {
    x: (pointer.x - position.x) / scale,
    y: (pointer.y - position.y) / scale,
  };
}

/**
 * Check if a Konva event target is empty space (stage or background),
 * as opposed to an interactive element.
 */
export function isEmptySpaceClick(
  e: Konva.KonvaEventObject<MouseEvent>,
): boolean {
  const clickedOnStage = e.target === e.target.getStage();
  const clickedOnBackground = e.target.attrs?.id === "background";
  return clickedOnStage || clickedOnBackground;
}

/**
 * Snap an endpoint to the nearest 45° angle from the start point.
 */
export function snapToAngle(
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
  return {
    x: start.x + Math.cos(snapped) * distance,
    y: start.y + Math.sin(snapped) * distance,
  };
}

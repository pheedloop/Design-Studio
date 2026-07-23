import { useCallback, useState } from "react";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseCropOptions {
  canvasWidth: number;
  canvasHeight: number;
  onComplete: (rect: CropRect) => void;
}

/**
 * Crop-mode state, mirroring useCalibration. The crop rectangle starts at the
 * full canvas and is adjusted via the CropOverlay's drag/resize handles; the
 * host applies it on confirm. Purely local editor state (not persisted).
 */
export function useCrop({
  canvasWidth,
  canvasHeight,
  onComplete,
}: UseCropOptions) {
  const [rect, setRect] = useState<CropRect>({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
  });

  // Reset the crop box to the full canvas; call when entering crop mode.
  const start = useCallback(() => {
    setRect({ x: 0, y: 0, width: canvasWidth, height: canvasHeight });
  }, [canvasWidth, canvasHeight]);

  const confirm = useCallback(() => {
    // Clamp the rect into the canvas and guard a minimum size.
    const x = Math.max(0, Math.min(rect.x, canvasWidth));
    const y = Math.max(0, Math.min(rect.y, canvasHeight));
    const width = Math.max(1, Math.min(rect.width, canvasWidth - x));
    const height = Math.max(1, Math.min(rect.height, canvasHeight - y));
    onComplete({ x, y, width, height });
  }, [rect, canvasWidth, canvasHeight, onComplete]);

  return { rect, setRect, start, confirm };
}

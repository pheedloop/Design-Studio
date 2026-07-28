import type Konva from "konva";

import type { FloorPlanData } from "../../types";

export const CAPTURE_EXCLUDE_NAME = "pl-capture-exclude";

export const THUMBNAIL_MAX_EDGE = 480;

interface CaptureOptions {
  /** Cap for the longest side; the other side follows the plan's aspect ratio. */
  maxEdge?: number;
}

export async function captureFloorPlanThumbnail(
  stage: Konva.Stage | null | undefined,
  data: FloorPlanData,
  { maxEdge = THUMBNAIL_MAX_EDGE }: CaptureOptions = {},
): Promise<Blob | null> {
  const { width, height } = data.dimensions;
  if (!stage || !width || !height) return null;

  // Bound the longest side, not the width: a plan taller than ~4x its width
  // would otherwise produce a PNG thousands of pixels tall.
  const ratio = Math.min(maxEdge / width, maxEdge / height);
  const previous = { scale: stage.scaleX(), x: stage.x(), y: stage.y() };
  const chrome = stage
    .find(`.${CAPTURE_EXCLUDE_NAME}`)
    .filter((node) => node.visible());

  let canvas: HTMLCanvasElement;
  try {
    stage.scale({ x: ratio, y: ratio });
    stage.position({ x: 0, y: 0 });
    chrome.forEach((node) => node.visible(false));

    canvas = stage.toCanvas({
      x: 0,
      y: 0,
      width: Math.max(1, Math.round(width * ratio)),
      height: Math.max(1, Math.round(height * ratio)),
      pixelRatio: 1,
    });
  } catch {
    return null;
  } finally {
    chrome.forEach((node) => node.visible(true));
    stage.scale({ x: previous.scale, y: previous.scale });
    stage.position({ x: previous.x, y: previous.y });
  }

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

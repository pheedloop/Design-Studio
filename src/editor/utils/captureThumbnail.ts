import type Konva from "konva";

import type { FloorPlanData } from "../../types";

export const CAPTURE_EXCLUDE_NAME = "pl-capture-exclude";

export const THUMBNAIL_MAX_WIDTH = 480;

interface CaptureOptions {
  maxWidth?: number;
}

export async function captureFloorPlanThumbnail(
  stage: Konva.Stage | null | undefined,
  data: FloorPlanData,
  { maxWidth = THUMBNAIL_MAX_WIDTH }: CaptureOptions = {},
): Promise<Blob | null> {
  const { width, height } = data.dimensions;
  if (!stage || !width || !height) return null;

  const ratio = maxWidth / width;
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
      width: maxWidth,
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

import type Konva from "konva";

export async function captureBadgeThumbnail(
  stage: Konva.Stage | null,
): Promise<Blob | null> {
  if (!stage) return null;
  let canvas: HTMLCanvasElement;
  try {
    canvas = stage.toCanvas({ pixelRatio: 1 });
  } catch {
    return null;
  }
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

import type { HolePunch } from "./model";
import { mmToPx } from "./canvasMetrics";

export interface HolePunchBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function holePunchBoxes(
  punch: HolePunch,
  panelWidthPx: number,
): HolePunchBox[] {
  const width = mmToPx(punch.widthMm);
  const height = mmToPx(punch.heightMm);
  const pitch = mmToPx(punch.pitchMm);
  const y = mmToPx(punch.topOffsetMm);
  const count = Math.max(0, Math.floor(punch.count));
  return Array.from({ length: count }, (_, i) => {
    const centreX = panelWidthPx / 2 + (i - (count - 1) / 2) * pitch;
    return { x: centreX - width / 2, y, width, height };
  });
}

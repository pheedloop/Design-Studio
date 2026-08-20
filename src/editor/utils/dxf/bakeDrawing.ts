import type { DxfPrimitive } from "@/types";

export type FitMode = "fit" | "resize";

export interface BakeResult {
  /** Primitives transformed into canvas pixel space (Y already flipped). */
  primitives: DxfPrimitive[];
  /** Canvas size implied by the chosen mode. */
  width: number;
  height: number;
  /** Canvas pixels per DXF drawing unit (used for scale calibration). */
  scale: number;
}

interface BakeOptions {
  /** Target box the drawing is fit into (usually the current canvas size). */
  box: { width: number; height: number };
  /** World-space extent of the full drawing (stable across layer filtering). */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** "fit": keep box size, center the drawing. "resize": box becomes the
   *  drawing's scaled extent (no margins). */
  mode: FitMode;
  /** Fraction of the box to fill (e.g. 0.9 leaves a preview margin). */
  fill?: number;
}

/** Transform DXF-space primitives into canvas pixels: uniform fit scale, Y-flip
 *  (DXF is Y-up, canvas is Y-down), and centering per the fit mode. */
export function bakeDrawing(
  primitives: DxfPrimitive[],
  opts: BakeOptions,
): BakeResult {
  const { box, bounds, mode } = opts;
  const fill = opts.fill ?? 1;
  const dxfW = Math.max(bounds.maxX - bounds.minX, 1e-6);
  const dxfH = Math.max(bounds.maxY - bounds.minY, 1e-6);
  const scale = (Math.min(box.width / dxfW, box.height / dxfH) || 1) * fill;

  const drawnW = dxfW * scale;
  const drawnH = dxfH * scale;
  const width = mode === "resize" ? drawnW : box.width;
  const height = mode === "resize" ? drawnH : box.height;
  const offsetX = mode === "resize" ? 0 : (width - drawnW) / 2;
  const offsetY = mode === "resize" ? 0 : (height - drawnH) / 2;

  const mapX = (x: number) => (x - bounds.minX) * scale + offsetX;
  const mapY = (y: number) => (bounds.maxY - y) * scale + offsetY; // Y-flip

  const baked = primitives.map((p): DxfPrimitive => {
    switch (p.kind) {
      case "line":
      case "polyline": {
        const out: number[] = [];
        for (let i = 0; i < p.points.length; i += 2) {
          out.push(mapX(p.points[i]), mapY(p.points[i + 1]));
        }
        return { ...p, points: out };
      }
      case "circle":
        return { ...p, cx: mapX(p.cx), cy: mapY(p.cy), r: p.r * scale };
      case "text":
        return {
          ...p,
          x: mapX(p.x),
          y: mapY(p.y),
          height: p.height * scale,
          rotation: -p.rotation, // Y-flip mirrors the baseline angle
        };
    }
  });

  return { primitives: baked, width, height, scale };
}

import type { DxfPrimitive } from "../../../types";

/**
 * Coordinate transforms over baked DXF primitives. All variants store their
 * geometry differently (flat point arrays, circle center+radius, text anchor),
 * so anything that walks or rewrites coordinates would otherwise repeat the
 * same per-`kind` switch. These two helpers centralize that walk.
 */

/** Visit every (x, y) coordinate of a primitive in source order. */
export function forEachPoint(
  p: DxfPrimitive,
  fn: (x: number, y: number) => void
): void {
  switch (p.kind) {
    case "line":
    case "polyline":
      for (let i = 0; i < p.points.length; i += 2) fn(p.points[i], p.points[i + 1]);
      return;
    case "circle":
      // Bounding extents rather than the center, so callers accumulating bounds
      // see the full circle.
      fn(p.cx - p.r, p.cy - p.r);
      fn(p.cx + p.r, p.cy + p.r);
      return;
    case "text":
      fn(p.x, p.y);
      return;
  }
}

/** Axis-aligned bounding box of a single primitive (canvas-space). */
export function primitiveBounds(p: DxfPrimitive): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  forEachPoint(p, (x, y) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });
  return { minX, minY, maxX, maxY };
}

/**
 * Rewrite a primitive's coordinates through `fn`. `scalar` multiplies the
 * scale-sensitive scalar fields (circle radius, text height) — pass 1 for a
 * pure translate, or the uniform scale factor for a resize.
 */
export function mapPrimitive(
  p: DxfPrimitive,
  fn: (x: number, y: number) => [number, number],
  scalar = 1
): DxfPrimitive {
  switch (p.kind) {
    case "line":
    case "polyline": {
      const points: number[] = new Array(p.points.length);
      for (let i = 0; i < p.points.length; i += 2) {
        const [x, y] = fn(p.points[i], p.points[i + 1]);
        points[i] = x;
        points[i + 1] = y;
      }
      return { ...p, points };
    }
    case "circle": {
      const [cx, cy] = fn(p.cx, p.cy);
      return { ...p, cx, cy, r: p.r * scalar };
    }
    case "text": {
      const [x, y] = fn(p.x, p.y);
      return { ...p, x, y, height: p.height * scalar };
    }
  }
}

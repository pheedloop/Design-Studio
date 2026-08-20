import type { FloorPlanElement, Geometry } from "../../types";

export interface ElementBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

/** Local bounding box of a geometry (width/height, no absolute position). */
export interface GeometryBounds {
  width: number;
  height: number;
}

export function getGeometryBounds(geo: Geometry): GeometryBounds {
  if (geo.shape === "rect") {
    return { width: geo.width, height: geo.height };
  }
  if (geo.shape === "polygon") {
    const pts = geo.points;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (let i = 0; i < pts.length; i += 2) {
      if (pts[i] < minX) minX = pts[i];
      if (pts[i] > maxX) maxX = pts[i];
      if (pts[i + 1] < minY) minY = pts[i + 1];
      if (pts[i + 1] > maxY) maxY = pts[i + 1];
    }
    return { width: maxX - minX, height: maxY - minY };
  }
  if (geo.shape === "ellipse") {
    return { width: geo.radiusX * 2, height: geo.radiusY * 2 };
  }
  if (geo.shape === "circle") {
    return { width: geo.radius * 2, height: geo.radius * 2 };
  }
  // line, arrow, arc — use points extent
  if ("points" in geo) {
    const pts = geo.points;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (let i = 0; i < pts.length; i += 2) {
      if (pts[i] < minX) minX = pts[i];
      if (pts[i] > maxX) maxX = pts[i];
      if (pts[i + 1] < minY) minY = pts[i + 1];
      if (pts[i + 1] > maxY) maxY = pts[i + 1];
    }
    return { width: maxX - minX, height: maxY - minY };
  }
  return { width: 0, height: 0 };
}

export function getElementBounds(element: FloorPlanElement): ElementBounds {
  const geo = element.geometry;

  if (geo.shape === "rect") {
    return {
      left: geo.x,
      right: geo.x + geo.width,
      top: geo.y,
      bottom: geo.y + geo.height,
      centerX: geo.x + geo.width / 2,
      centerY: geo.y + geo.height / 2,
    };
  }

  if (geo.shape === "ellipse") {
    return {
      left: geo.x,
      right: geo.x + geo.radiusX * 2,
      top: geo.y,
      bottom: geo.y + geo.radiusY * 2,
      centerX: geo.x + geo.radiusX,
      centerY: geo.y + geo.radiusY,
    };
  }

  if (geo.shape === "line") {
    const [x1, y1, x2, y2] = geo.points;
    const absX1 = geo.x + x1;
    const absY1 = geo.y + y1;
    const absX2 = geo.x + x2;
    const absY2 = geo.y + y2;
    return {
      left: Math.min(absX1, absX2),
      right: Math.max(absX1, absX2),
      top: Math.min(absY1, absY2),
      bottom: Math.max(absY1, absY2),
      centerX: (absX1 + absX2) / 2,
      centerY: (absY1 + absY2) / 2,
    };
  }

  if (geo.shape === "polygon") {
    const pts = geo.points;
    let left = Infinity,
      right = -Infinity,
      top = Infinity,
      bottom = -Infinity;
    for (let i = 0; i < pts.length; i += 2) {
      const ax = geo.x + pts[i];
      const ay = geo.y + pts[i + 1];
      if (ax < left) left = ax;
      if (ax > right) right = ax;
      if (ay < top) top = ay;
      if (ay > bottom) bottom = ay;
    }
    return {
      left,
      right,
      top,
      bottom,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
    };
  }

  if (geo.shape === "arc") {
    const [x1, y1, cx, cy, x2, y2] = geo.points;
    const absX1 = geo.x + x1;
    const absY1 = geo.y + y1;
    const absCx = geo.x + cx;
    const absCy = geo.y + cy;
    const absX2 = geo.x + x2;
    const absY2 = geo.y + y2;
    // Bounding box of the three control points covers the curve
    const left = Math.min(absX1, absCx, absX2);
    const right = Math.max(absX1, absCx, absX2);
    const top = Math.min(absY1, absCy, absY2);
    const bottom = Math.max(absY1, absCy, absY2);
    return {
      left,
      right,
      top,
      bottom,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
    };
  }

  // Fallback
  const x = "x" in geo ? geo.x : 0;
  const y = "y" in geo ? geo.y : 0;
  return { left: x, right: x, top: y, bottom: y, centerX: x, centerY: y };
}

/** Check if a line segment intersects an axis-aligned rectangle. */
export function lineIntersectsRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  // If either endpoint is inside the rect, it intersects
  if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
  if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;

  // Check if line segment intersects any of the 4 rect edges
  const edges: [number, number, number, number][] = [
    [rx, ry, rx + rw, ry], // top
    [rx, ry + rh, rx + rw, ry + rh], // bottom
    [rx, ry, rx, ry + rh], // left
    [rx + rw, ry, rx + rw, ry + rh], // right
  ];

  for (const [ex1, ey1, ex2, ey2] of edges) {
    if (segmentsIntersect(x1, y1, x2, y2, ex1, ey1, ex2, ey2)) return true;
  }
  return false;
}

function segmentsIntersect(
  ax1: number,
  ay1: number,
  ax2: number,
  ay2: number,
  bx1: number,
  by1: number,
  bx2: number,
  by2: number,
): boolean {
  const d1 = cross(bx1, by1, bx2, by2, ax1, ay1);
  const d2 = cross(bx1, by1, bx2, by2, ax2, ay2);
  const d3 = cross(ax1, ay1, ax2, ay2, bx1, by1);
  const d4 = cross(ax1, ay1, ax2, ay2, bx2, by2);

  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true;
  }

  if (d1 === 0 && onSegment(bx1, by1, bx2, by2, ax1, ay1)) return true;
  if (d2 === 0 && onSegment(bx1, by1, bx2, by2, ax2, ay2)) return true;
  if (d3 === 0 && onSegment(ax1, ay1, ax2, ay2, bx1, by1)) return true;
  if (d4 === 0 && onSegment(ax1, ay1, ax2, ay2, bx2, by2)) return true;

  return false;
}

function cross(
  ox: number,
  oy: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
}

function onSegment(
  px: number,
  py: number,
  qx: number,
  qy: number,
  rx: number,
  ry: number,
): boolean {
  return (
    rx >= Math.min(px, qx) &&
    rx <= Math.max(px, qx) &&
    ry >= Math.min(py, qy) &&
    ry <= Math.max(py, qy)
  );
}

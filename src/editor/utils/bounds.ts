import type { FloorPlanElement, Geometry } from "@/types";

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

function boundsOf(
  left: number,
  top: number,
  right: number,
  bottom: number,
): ElementBounds {
  return {
    left,
    right,
    top,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
}

// A box drawn from its top-left corner and rotated about it (degrees), as the
// canvas draws rects and ellipses.
function rotatedBoxBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
): ElementBounds {
  if (!rotation) return boundsOf(x, y, x + width, y + height);
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const xs = [0, width * cos, width * cos - height * sin, -height * sin];
  const ys = [0, width * sin, width * sin + height * cos, height * cos];
  return boundsOf(
    x + Math.min(...xs),
    y + Math.min(...ys),
    x + Math.max(...xs),
    y + Math.max(...ys),
  );
}

export function getElementBounds(element: FloorPlanElement): ElementBounds {
  const geo = element.geometry;

  if (geo.shape === "rect") {
    return rotatedBoxBounds(geo.x, geo.y, geo.width, geo.height, geo.rotation);
  }

  if (geo.shape === "ellipse") {
    const { radiusX: rx, radiusY: ry } = geo;
    const rad = ((geo.rotation ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // Drawn from its box's top-left corner and rotated about it.
    const cx = geo.x + rx * cos - ry * sin;
    const cy = geo.y + rx * sin + ry * cos;
    const halfW = Math.hypot(rx * cos, ry * sin);
    const halfH = Math.hypot(rx * sin, ry * cos);
    return boundsOf(cx - halfW, cy - halfH, cx + halfW, cy + halfH);
  }

  if (geo.shape === "circle") {
    return boundsOf(
      geo.x,
      geo.y,
      geo.x + geo.radius * 2,
      geo.y + geo.radius * 2,
    );
  }

  if (geo.shape === "line" || geo.shape === "arrow") {
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

  // Arc: the bounding box of the three control points covers the curve.
  const [x1, y1, cx, cy, x2, y2] = geo.points;
  const absX1 = geo.x + x1;
  const absY1 = geo.y + y1;
  const absCx = geo.x + cx;
  const absCy = geo.y + cy;
  const absX2 = geo.x + x2;
  const absY2 = geo.y + y2;
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

// The box that hugs an element as drawn: rect and ellipse keep their rotation,
// every other geometry falls back to its axis-aligned bounds.
export function getElementOutline(element: FloorPlanElement): {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
} {
  const geo = element.geometry;
  if (geo.shape === "rect") {
    const { x, y, width, height } = geo;
    return { x, y, width, height, rotation: geo.rotation ?? 0 };
  }
  if (geo.shape === "ellipse") {
    const { x, y, radiusX, radiusY } = geo;
    return {
      x,
      y,
      width: radiusX * 2,
      height: radiusY * 2,
      rotation: geo.rotation ?? 0,
    };
  }
  const b = getElementBounds(element);
  return {
    x: b.left,
    y: b.top,
    width: b.right - b.left,
    height: b.bottom - b.top,
    rotation: 0,
  };
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

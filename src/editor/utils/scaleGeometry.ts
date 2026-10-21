import type { Geometry } from "@/types";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Fit a geometry that sat inside `from` into the same place inside `to`.
export function scaleGeometry(
  geo: Geometry,
  from: Box,
  to: Box,
): Partial<Geometry> {
  const sx = to.width / from.width;
  const sy = to.height / from.height;
  const map = (x: number, y: number) => ({
    x: to.x + (x - from.x) * sx,
    y: to.y + (y - from.y) * sy,
  });

  if (geo.shape === "rect" || geo.shape === "ellipse") {
    const width = geo.shape === "rect" ? geo.width : geo.radiusX * 2;
    const height = geo.shape === "rect" ? geo.height : geo.radiusY * 2;
    const rad = ((geo.rotation ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Stretch the shape's own axes. Stretching a rotated box unevenly would
    // skew it, which the model can't store; the nearest rotated box keeps the
    // stretched x axis and both axis lengths.
    const axisX = { x: cos * sx, y: sin * sy };
    const axisY = { x: -sin * sx, y: cos * sy };
    const newWidth = width * Math.hypot(axisX.x, axisX.y);
    const newHeight = height * Math.hypot(axisY.x, axisY.y);
    const newRad = Math.atan2(axisX.y, axisX.x);
    const newCos = Math.cos(newRad);
    const newSin = Math.sin(newRad);

    const center = map(
      geo.x + (width / 2) * cos - (height / 2) * sin,
      geo.y + (width / 2) * sin + (height / 2) * cos,
    );
    const x = center.x - ((newWidth / 2) * newCos - (newHeight / 2) * newSin);
    const y = center.y - ((newWidth / 2) * newSin + (newHeight / 2) * newCos);
    const rotation =
      geo.rotation === undefined ? {} : { rotation: (newRad * 180) / Math.PI };

    return geo.shape === "rect"
      ? { x, y, width: newWidth, height: newHeight, ...rotation }
      : { x, y, radiusX: newWidth / 2, radiusY: newHeight / 2, ...rotation };
  }

  if (geo.shape === "circle") {
    // A circle stays a circle, so it takes the smaller stretch about its centre.
    const radius = geo.radius * Math.min(sx, sy);
    const center = map(geo.x + geo.radius, geo.y + geo.radius);
    return { x: center.x - radius, y: center.y - radius, radius };
  }

  // Point shapes: the anchor moves with the box, offsets stretch with it.
  const anchor = map(geo.x, geo.y);
  const points = geo.points.map((v, i) => v * (i % 2 === 0 ? sx : sy));
  return { ...anchor, points } as Partial<Geometry>;
}

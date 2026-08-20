import { describe, it, expect } from "vitest";
import type { DxfPrimitive } from "@/types";
import { forEachPoint, primitiveBounds, mapPrimitive } from "./primitiveOps";

const line = (points: number[]): DxfPrimitive => ({
  kind: "line",
  layer: "WALLS",
  points,
});

const circle = (cx: number, cy: number, r: number): DxfPrimitive => ({
  kind: "circle",
  layer: "HOLES",
  cx,
  cy,
  r,
});

const text = (x: number, y: number, height: number): DxfPrimitive => ({
  kind: "text",
  layer: "LABELS",
  text: "A1",
  x,
  y,
  height,
  rotation: 0,
});

function visited(p: DxfPrimitive): [number, number][] {
  const out: [number, number][] = [];
  forEachPoint(p, (x, y) => out.push([x, y]));
  return out;
}

describe("forEachPoint", () => {
  it("walks a flat point array as (x, y) pairs in source order", () => {
    expect(visited(line([0, 1, 2, 3, 4, 5]))).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
    ]);
  });

  it("visits a circle's bounding extents rather than its center", () => {
    // Callers accumulate bounds through this walk, so a circle has to report
    // the corners of its box — reporting the center would clip the drawing to
    // the radius on every side.
    expect(visited(circle(10, 20, 3))).toEqual([
      [7, 17],
      [13, 23],
    ]);
  });

  it("visits a text primitive's anchor", () => {
    expect(visited(text(5, 6, 2))).toEqual([[5, 6]]);
  });
});

describe("primitiveBounds", () => {
  it("spans the extreme coordinates of a point array", () => {
    expect(primitiveBounds(line([10, 5, -2, 40, 7, 0]))).toEqual({
      minX: -2,
      minY: 0,
      maxX: 10,
      maxY: 40,
    });
  });

  it("encloses a whole circle, not just its center", () => {
    expect(primitiveBounds(circle(10, 20, 3))).toEqual({
      minX: 7,
      minY: 17,
      maxX: 13,
      maxY: 23,
    });
  });
});

describe("mapPrimitive", () => {
  it("rewrites every coordinate of a point array", () => {
    const out = mapPrimitive(line([0, 0, 10, 5]), (x, y) => [x + 100, y + 200]);
    expect(out).toMatchObject({ kind: "line", points: [100, 200, 110, 205] });
  });

  it("preserves the closed flag and layer of a polyline", () => {
    const closed: DxfPrimitive = {
      kind: "polyline",
      layer: "ROOMS",
      points: [0, 0, 1, 0, 1, 1],
      closed: true,
    };
    expect(mapPrimitive(closed, (x, y) => [x, y])).toMatchObject({
      layer: "ROOMS",
      closed: true,
    });
  });

  it("leaves scale-sensitive fields alone when scalar is omitted", () => {
    // The default exists for translation, where scaling a radius or a text
    // height would silently distort the drawing.
    expect(
      mapPrimitive(circle(0, 0, 4), (x, y) => [x + 1, y + 1]),
    ).toMatchObject({ cx: 1, cy: 1, r: 4 });
    expect(
      mapPrimitive(text(0, 0, 12), (x, y) => [x + 1, y + 1]),
    ).toMatchObject({ x: 1, y: 1, height: 12 });
  });

  it("multiplies circle radius and text height by scalar", () => {
    expect(
      mapPrimitive(circle(2, 2, 4), (x, y) => [x * 3, y * 3], 3),
    ).toMatchObject({ cx: 6, cy: 6, r: 12 });
    expect(
      mapPrimitive(text(2, 2, 10), (x, y) => [x * 3, y * 3], 3),
    ).toMatchObject({ x: 6, y: 6, height: 30 });
  });

  it("does not mutate its input", () => {
    // Callers map over primitives held in editor state, so aliasing the source
    // array would corrupt the undo history.
    const src = line([0, 0, 10, 5]);
    const out = mapPrimitive(src, (x, y) => [x + 1, y + 1]);
    expect(src).toEqual(line([0, 0, 10, 5]));
    expect(out).not.toBe(src);
  });
});

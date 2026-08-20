import { describe, it, expect } from "vitest";
import type { DxfPrimitive } from "@/types";
import { bakeDrawing } from "./bakeDrawing";

/** A 10 × 5 drawing: wide enough that width and height fit at different
 *  factors, so the uniform-scale choice is observable. */
const BOUNDS = { minX: 0, minY: 0, maxX: 10, maxY: 5 };
const BOX = { width: 100, height: 100 };

const diagonal: DxfPrimitive = {
  kind: "line",
  layer: "WALLS",
  points: [0, 0, 10, 5],
};

describe("bakeDrawing", () => {
  it("scales by the tighter of the two axes", () => {
    // width fits at 10x, height at 20x — picking the larger would overflow.
    const { scale } = bakeDrawing([diagonal], {
      box: BOX,
      bounds: BOUNDS,
      mode: "fit",
    });
    expect(scale).toBe(10);
  });

  it("flips Y: the top of the drawing becomes the top of the canvas", () => {
    // DXF is Y-up, canvas is Y-down. The DXF origin (0,0) is the drawing's
    // bottom-left, so it must land at the *largest* canvas y.
    const { primitives } = bakeDrawing([diagonal], {
      box: BOX,
      bounds: BOUNDS,
      mode: "fit",
    });
    // (0,0) → (0, 75) and (10,5) → (100, 25); centered vertically by 25.
    expect(primitives[0]).toMatchObject({ points: [0, 75, 100, 25] });
  });

  it("keeps the box size and centers the drawing in fit mode", () => {
    const { width, height } = bakeDrawing([diagonal], {
      box: BOX,
      bounds: BOUNDS,
      mode: "fit",
    });
    expect({ width, height }).toEqual({ width: 100, height: 100 });
  });

  it("shrinks the box to the drawing's extent in resize mode", () => {
    const { width, height, primitives } = bakeDrawing([diagonal], {
      box: BOX,
      bounds: BOUNDS,
      mode: "resize",
    });
    expect({ width, height }).toEqual({ width: 100, height: 50 });
    // No margin to center into, so the drawing spans the canvas exactly.
    expect(primitives[0]).toMatchObject({ points: [0, 50, 100, 0] });
  });

  it("applies fill as a fraction of the box, then re-centers", () => {
    const { scale, primitives } = bakeDrawing([diagonal], {
      box: BOX,
      bounds: BOUNDS,
      mode: "fit",
      fill: 0.9,
    });
    expect(scale).toBe(9);
    // 90 × 45 drawn inside 100 × 100 → margins of 5 and 27.5.
    expect(primitives[0]).toMatchObject({ points: [5, 72.5, 95, 27.5] });
  });

  it("scales a circle's radius and flips its center", () => {
    const circle: DxfPrimitive = {
      kind: "circle",
      layer: "HOLES",
      cx: 2,
      cy: 3,
      r: 1,
    };
    const { primitives } = bakeDrawing([circle], {
      box: BOX,
      bounds: BOUNDS,
      mode: "fit",
    });
    expect(primitives[0]).toMatchObject({ cx: 20, cy: 45, r: 10 });
  });

  it("scales text height and negates its rotation", () => {
    // The Y-flip mirrors the baseline, so a rotation that read counter-clockwise
    // in DXF space has to read clockwise on the canvas.
    const text: DxfPrimitive = {
      kind: "text",
      layer: "LABELS",
      text: "A1",
      x: 0,
      y: 5,
      height: 2,
      rotation: Math.PI / 4,
    };
    const { primitives } = bakeDrawing([text], {
      box: BOX,
      bounds: BOUNDS,
      mode: "fit",
    });
    expect(primitives[0]).toMatchObject({
      x: 0,
      y: 25,
      height: 20,
      rotation: -Math.PI / 4,
    });
  });

  it("survives a zero-extent drawing without emitting NaN", () => {
    // A single point (or one perfectly straight wall) collapses an axis. The
    // 1e-6 floor keeps the division finite instead of poisoning every
    // coordinate downstream.
    const dot: DxfPrimitive = { kind: "line", layer: "0", points: [7, 7] };
    const { primitives, scale, width, height } = bakeDrawing([dot], {
      box: BOX,
      bounds: { minX: 7, minY: 7, maxX: 7, maxY: 7 },
      mode: "fit",
    });
    expect(Number.isFinite(scale)).toBe(true);
    expect(Number.isFinite(width) && Number.isFinite(height)).toBe(true);
    const points = (primitives[0] as { points: number[] }).points;
    expect(points.every(Number.isFinite)).toBe(true);
  });

  it("falls back to scale 1 for a zero-sized box", () => {
    // A canvas measured before layout reports 0 × 0; scaling by 0 would erase
    // the import outright.
    const { scale } = bakeDrawing([diagonal], {
      box: { width: 0, height: 0 },
      bounds: BOUNDS,
      mode: "fit",
    });
    expect(scale).toBe(1);
  });
});

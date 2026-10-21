import { describe, expect, it } from "vitest";
import { getElementBounds, getElementOutline } from "./bounds";
import type { FloorPlanElement, Geometry } from "@/types";

const el = (geometry: Geometry) =>
  ({ id: "e", type: "booth", geometry, properties: {} }) as FloorPlanElement;

describe("getElementOutline", () => {
  it("keeps a rotated rect's own box and rotation", () => {
    expect(
      getElementOutline(
        el({
          shape: "rect",
          x: 10,
          y: 20,
          width: 30,
          height: 40,
          rotation: 45,
        }),
      ),
    ).toEqual({ x: 10, y: 20, width: 30, height: 40, rotation: 45 });
  });

  it("falls back to axis-aligned bounds for point shapes", () => {
    expect(
      getElementOutline(
        el({ shape: "polygon", x: 5, y: 5, points: [0, 0, 20, 0, 10, 30] }),
      ),
    ).toEqual({ x: 5, y: 5, width: 20, height: 30, rotation: 0 });
  });
});

describe("getElementBounds", () => {
  it("covers a rotated rect's corners", () => {
    const b = getElementBounds(
      el({ shape: "rect", x: 10, y: 0, width: 20, height: 10, rotation: 90 }),
    );
    expect([b.left, b.top, b.right, b.bottom].map(Math.round)).toEqual([
      0, 0, 10, 20,
    ]);
  });

  it("hugs a rotated ellipse, not its box's corners", () => {
    const b = getElementBounds(
      el({
        shape: "ellipse",
        x: 0,
        y: 0,
        radiusX: 50,
        radiusY: 50,
        rotation: 45,
      }),
    );
    expect(Math.round(b.right - b.left)).toBe(100);
  });

  it("measures arrows like lines", () => {
    const b = getElementBounds(
      el({ shape: "arrow", x: 5, y: 5, points: [0, 0, 10, 20] }),
    );
    expect([b.left, b.top, b.right, b.bottom]).toEqual([5, 5, 15, 25]);
  });
});

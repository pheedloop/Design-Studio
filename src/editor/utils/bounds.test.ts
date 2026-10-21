import { describe, expect, it } from "vitest";
import { getElementOutline } from "./bounds";
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

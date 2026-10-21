import { describe, expect, it } from "vitest";
import { scaleGeometry } from "./scaleGeometry";

const round = (o: object) =>
  JSON.parse(
    JSON.stringify(o, (_, v) =>
      typeof v === "number" ? Math.round(v * 1000) / 1000 : v,
    ),
  );

describe("scaleGeometry", () => {
  it("stretches an unrotated rect with the box", () => {
    expect(
      scaleGeometry(
        { shape: "rect", x: 10, y: 10, width: 10, height: 10 },
        { x: 0, y: 0, width: 40, height: 40 },
        { x: 100, y: 0, width: 80, height: 20 },
      ),
    ).toEqual({ x: 120, y: 5, width: 20, height: 5 });
  });

  // A 90°-rotated booth stretched sideways grows along its own height and
  // still fills its slot; scaling the unrotated width/height skewed it off.
  it("stretches a rotated rect along its own axes", () => {
    expect(
      round(
        scaleGeometry(
          { shape: "rect", x: 10, y: 0, width: 20, height: 10, rotation: 90 },
          { x: 0, y: 0, width: 10, height: 20 },
          { x: 0, y: 0, width: 20, height: 20 },
        ),
      ),
    ).toEqual({ x: 20, y: 0, width: 20, height: 20, rotation: 90 });
  });

  it("keeps a circle round, centred where the box puts it", () => {
    expect(
      scaleGeometry(
        { shape: "circle", x: 0, y: 0, radius: 10 },
        { x: 0, y: 0, width: 20, height: 20 },
        { x: 0, y: 0, width: 40, height: 20 },
      ),
    ).toEqual({ x: 10, y: 0, radius: 10 });
  });
});

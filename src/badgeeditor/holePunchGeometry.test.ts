import { describe, expect, it } from "vitest";
import { holePunchBoxes } from "./holePunchGeometry";

const px = (mm: number) => (mm / 25.4) * 96;
const PANEL_4IN = 384;

function expectBoxes(
  actual: ReturnType<typeof holePunchBoxes>,
  expectedMm: readonly {
    x: number;
    y: number;
    width: number;
    height: number;
  }[],
) {
  expect(actual).toHaveLength(expectedMm.length);
  expectedMm.forEach((box, i) => {
    expect(actual[i].x).toBeCloseTo(px(box.x), 6);
    expect(actual[i].y).toBeCloseTo(px(box.y), 6);
    expect(actual[i].width).toBeCloseTo(px(box.width), 6);
    expect(actual[i].height).toBeCloseTo(px(box.height), 6);
  });
}

describe("holePunchBoxes", () => {
  it.each([
    {
      name: "two 4mm holes 69mm apart",
      punch: {
        shape: "circle",
        count: 2,
        widthMm: 4,
        heightMm: 4,
        pitchMm: 69,
        topOffsetMm: 5,
      },
      boxes: [
        { x: 14.3, y: 5, width: 4, height: 4 },
        { x: 83.3, y: 5, width: 4, height: 4 },
      ],
    },
    {
      name: "three 16×4mm slots 34mm apart",
      punch: {
        shape: "rect",
        count: 3,
        widthMm: 16,
        heightMm: 4,
        pitchMm: 34,
        topOffsetMm: 5,
      },
      boxes: [
        { x: 8.8, y: 5, width: 16, height: 4 },
        { x: 42.8, y: 5, width: 16, height: 4 },
        { x: 76.8, y: 5, width: 16, height: 4 },
      ],
    },
  ] as const)("centres $name on a 4-inch panel", ({ punch, boxes }) => {
    expectBoxes(holePunchBoxes(punch, PANEL_4IN), boxes);
  });
});

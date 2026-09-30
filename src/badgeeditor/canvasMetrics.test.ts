import { describe, expect, it } from "vitest";
import {
  clampResizeToPanel,
  clampToPanel,
  panelCornerRadii,
} from "./canvasMetrics";

const PANEL = { width: 4, height: 3 };

describe("clampToPanel", () => {
  it.each([
    ["leaves a box inside", { x: 1, y: 1 }, { x: 1, y: 1 }],
    ["stops at the top-left", { x: -0.5, y: -0.1 }, { x: 0, y: 0 }],
    ["stops at the bottom-right", { x: 3.5, y: 2.9 }, { x: 3, y: 2 }],
  ])("%s", (_, at, expected) => {
    expect(clampToPanel({ ...at, width: 1, height: 1 }, PANEL)).toEqual(
      expected,
    );
  });

  it("leaves an axis the box is too big for where it is", () => {
    expect(clampToPanel({ x: -1, y: 5, width: 6, height: 1 }, PANEL)).toEqual({
      x: -1,
      y: 2,
    });
  });
});

describe("clampResizeToPanel", () => {
  const OLD = { x: 1, y: 1, width: 1, height: 1 };

  it.each([
    [
      "stops the right edge",
      { ...OLD, width: 5 },
      "middle-right",
      false,
      { ...OLD, width: 3 },
    ],
    [
      "stops the left edge, keeping the right",
      { x: -2, y: 1, width: 4, height: 1 },
      "middle-left",
      false,
      { x: 0, y: 1, width: 2, height: 1 },
    ],
    [
      "keeps the ratio about the fixed corner",
      { x: 1, y: 1, width: 4, height: 4 },
      "bottom-right",
      true,
      { x: 1, y: 1, width: 2, height: 2 },
    ],
    [
      "leaves a resize inside alone",
      { ...OLD, height: 1.5 },
      "bottom-center",
      false,
      { ...OLD, height: 1.5 },
    ],
  ] as const)("%s", (_, newBox, anchor, keepRatio, expected) => {
    expect(clampResizeToPanel(OLD, newBox, PANEL, anchor, keepRatio)).toEqual(
      expected,
    );
  });

  it("lets an edge already past the panel stay but not grow", () => {
    const old = { x: 1, y: 1, width: 4, height: 1 };
    expect(
      clampResizeToPanel(
        old,
        { ...old, width: 4.5 },
        PANEL,
        "middle-right",
        false,
      ),
    ).toEqual(old);
  });
});

describe("panelCornerRadii", () => {
  it.each([
    ["a single panel", 0, 1, false, [6, 6, 6, 6]],
    ["the top of three", 0, 3, false, [6, 6, 0, 0]],
    ["the middle of three", 1, 3, true, [0, 0, 0, 0]],
    ["an inverted bottom panel", 1, 2, true, [6, 6, 0, 0]],
  ] as const)(
    "rounds only the sheet's outer corners of %s",
    (_, index, count, inverted, radii) => {
      expect(panelCornerRadii(index, count, 6, inverted)).toEqual(radii);
    },
  );
});

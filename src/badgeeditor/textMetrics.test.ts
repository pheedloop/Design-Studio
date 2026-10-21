import { describe, expect, it } from "vitest";
import { printFontPt, printFontPx, ptToPx } from "./textMetrics";

// Expected values are the Python formula worked by hand: pt = fontSize² / 32,
// then × 0.9 until the fit rules pass, floor 6 pt.
describe("printFontPt", () => {
  it.each([
    [
      "20 prints at 12.5 pt",
      { fontSize: 20, width: 3, height: 0.5 },
      "Ada",
      12.5,
    ],
    [
      "30 prints at 28.125 pt",
      { fontSize: 30, width: 5, height: 1, numLines: 1 },
      "Ada",
      28.125,
    ],
    [
      "shrinks to the 6 pt floor",
      { fontSize: 32, width: 1, height: 0.5, numLines: 1 },
      "x".repeat(200),
      6,
    ],
    [
      "width bound: 10 chars in 1 in, one line",
      { fontSize: 32, width: 1, height: 0, numLines: 1 },
      "x".repeat(10),
      32 * 0.9 ** 10,
    ],
    [
      "width bound: a second line allows a larger size",
      { fontSize: 32, width: 1, height: 0, numLines: 2 },
      "x".repeat(10),
      32 * 0.9 ** 3,
    ],
    [
      "height bound: 0.3 in, one line",
      { fontSize: 32, width: 9, height: 0.3, numLines: 1 },
      "Ada",
      32 * 0.9 ** 4,
    ],
    [
      "numLines defaults to floor(height px / fontSize)",
      { fontSize: 20, width: 9, height: 0.5 },
      "Ada",
      12.5,
    ],
  ])("%s", (_, field, text, pt) => {
    expect(printFontPt(field, text)).toBeCloseTo(pt, 6);
  });
});

describe("printFontPx", () => {
  it("rounds to one decimal of a point, then converts at 96 px/in", () => {
    expect(
      printFontPx({ fontSize: 30, width: 5, height: 1, numLines: 1 }, "Ada"),
    ).toBeCloseTo(ptToPx(28.1), 6);
    expect(ptToPx(12.5)).toBeCloseTo(16.6667, 4);
  });
});

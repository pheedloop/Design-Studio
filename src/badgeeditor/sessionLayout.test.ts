import { describe, expect, it } from "vitest";
import {
  SESSION_HEADER_LABELS,
  layoutSessionTable,
  sessionColumns,
  sessionLineHeight,
} from "./sessionLayout";

// 1 px per character, so wrapping is easy to reason about.
const measure = (text: string) => text.length;
const lineH = 13; // ceil(0.928 * 10) + ceil(0.244 * 10)
const base = { fontPx: 10, measure };

describe("sessionColumns", () => {
  it.each([
    [200, [0, 48, 106], [48, 58, 94]],
    [250, [0, 58, 128.5], [58, 70.5, 121.5]],
  ])(
    "sizes %d px as 20% / 25% content boxes plus padding, then the rest",
    (width, xs, widths) => {
      const cols = sessionColumns(width);
      expect(cols.map(c => c.x)).toEqual(xs);
      expect(cols.map(c => c.width)).toEqual(widths);
    },
  );
});

describe("sessionLineHeight", () => {
  // WeasyPrint's hinted line box for Roboto Condensed Bold at 8, 7, 6, 5, 10, 12 pt.
  it.each([
    [8, 13],
    [7, 12],
    [6, 10],
    [5, 9],
    [10, 17],
    [12, 19],
  ])("%d pt is %d px", (pt, px) => {
    expect(sessionLineHeight((pt * 96) / 72)).toBe(px);
  });
});

describe("layoutSessionTable", () => {
  it("keeps the printed header labels", () => {
    expect(SESSION_HEADER_LABELS).toEqual(["Date", "Time", "Session"]);
  });

  it("sizes a row by its tallest wrapped cell", () => {
    // Date column text width: 40 - 8 = 32; three 20-char words wrap to 3 lines.
    const one = layoutSessionTable({
      ...base,
      width: 200,
      rows: [["a", "b", "c"]],
    });
    const tall = layoutSessionTable({
      ...base,
      width: 200,
      rows: [
        [`${"a".repeat(20)} ${"b".repeat(20)} ${"c".repeat(20)}`, "b", "c"],
      ],
    });
    expect(tall.lines.filter(l => !l.header && l.x === 4)).toHaveLength(3);
    expect(tall.contentHeight - one.contentHeight).toBeCloseTo(2 * lineH);
  });

  it("is not clipped when taller than a box", () => {
    const rows = Array.from({ length: 20 }, () => ["a", "b", "c"]);
    const layout = layoutSessionTable({ ...base, width: 200, rows });
    expect(layout.contentHeight).toBeGreaterThan(100);
    expect(Math.max(...layout.lines.map(l => l.y))).toBeGreaterThan(100);
  });
});

import { describe, expect, it } from "vitest";
import { arrangeAsGrid } from "./alignment";
import { naturalCompare } from "@/utils/naturalSort";
import type { FloorPlanElement } from "@/types";

const rect = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  name?: string,
  groupId?: string,
) =>
  ({
    id,
    type: "booth",
    geometry: { shape: "rect", x, y, width, height },
    properties: { name, groupId },
  }) as unknown as FloorPlanElement;

function arrange(
  elements: FloorPlanElement[],
  cols: number,
  gap: number,
  compareNames?: (a: string, b: string) => number,
) {
  const moved = new Map(
    arrangeAsGrid(elements, cols, gap, gap, compareNames).map(u => [
      u.id,
      u.geometry,
    ]),
  );
  return elements.map(el => {
    const g = { ...el.geometry, ...moved.get(el.id) } as {
      x: number;
      y: number;
    };
    return [g.x, g.y];
  });
}

describe("arrangeAsGrid", () => {
  // ENG-4005: every cell was sized to the largest unit in the selection, so a
  // small booth next to a big one sat behind a far wider gap than asked for.
  it("sizes each column and row to its own largest unit", () => {
    const elements = [
      rect("a", 0, 0, 100, 50),
      rect("b", 200, 0, 150, 20),
      rect("c", 0, 100, 30, 80),
      rect("d", 200, 100, 60, 10),
    ];
    expect(arrange(elements, 2, 10)).toEqual([
      [0, 0],
      [110, 0],
      [0, 60],
      [110, 60],
    ]);
  });

  it("leaves same-size units on an even grid", () => {
    const elements = [0, 1, 2, 3].map(i => rect(`${i}`, i * 500, 0, 40, 40));
    expect(arrange(elements, 2, 5)).toEqual([
      [0, 0],
      [45, 0],
      [0, 45],
      [45, 45],
    ]);
  });

  it("orders by name, numbers by value, unnamed last", () => {
    const elements = [
      rect("ten", 0, 0, 10, 10, "10"),
      rect("blank", 20, 0, 10, 10),
      rect("two", 40, 0, 10, 10, "2"),
    ];
    expect(arrange(elements, 3, 5, naturalCompare("en"))).toEqual([
      [15, 0],
      [30, 0],
      [0, 0],
    ]);
  });

  it("orders a group by its lowest member name", () => {
    const elements = [
      rect("five", 0, 0, 10, 10, "5"),
      rect("thirty", 20, 0, 10, 10, "30", "g"),
      rect("three", 30, 0, 10, 10, "3", "g"),
    ];
    expect(arrange(elements, 2, 5, naturalCompare("en"))).toEqual([
      [25, 0],
      [0, 0],
      [10, 0],
    ]);
  });
});

import { describe, expect, it } from "vitest";
import type { ElementType, FloorPlanElement, LayerId } from "@/types";
import { findOverlappingElementIds } from "./overlappingElements";

function element(
  id: string,
  type: ElementType,
  x: number,
  y: number,
  layer?: LayerId,
): FloorPlanElement {
  return {
    id,
    type,
    ...(layer ? { layer } : {}),
    geometry: { shape: "rect", x, y, width: 100, height: 100 },
    properties: { color: "#000000", zIndex: 0 },
  };
}

describe("findOverlappingElementIds", () => {
  it("flags both sides of an intersection", () => {
    const ids = findOverlappingElementIds([
      element("a", "booth", 0, 0),
      element("b", "booth", 50, 50),
    ]);
    expect(ids).toEqual(new Set(["a", "b"]));
  });

  it("leaves elements that only share an edge alone", () => {
    const ids = findOverlappingElementIds([
      element("a", "booth", 0, 0),
      element("b", "booth", 100, 0),
    ]);
    expect(ids.size).toBe(0);
  });

  it("ignores elements off the content layer", () => {
    const ids = findOverlappingElementIds([
      element("a", "booth", 0, 0),
      element("b", "label", 50, 50),
    ]);
    expect(ids.size).toBe(0);
  });

  // An image is decoration, so it never collides — including when placement put
  // it on the content layer, which is what the active layer does to a new element.
  it("never flags an image, even on the content layer", () => {
    const ids = findOverlappingElementIds([
      element("a", "booth", 0, 0),
      element("b", "image", 10, 10, "content"),
    ]);
    expect(ids.size).toBe(0);
  });

  it("does not let two overlapping images flag each other", () => {
    const ids = findOverlappingElementIds([
      element("a", "image", 0, 0, "content"),
      element("b", "image", 10, 10, "content"),
    ]);
    expect(ids.size).toBe(0);
  });
});

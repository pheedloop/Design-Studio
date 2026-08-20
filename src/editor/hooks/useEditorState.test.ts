import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { DxfPrimitive, FloorPlanData } from "@/types";
import { useEditorState } from "./useEditorState";

/** The crop rectangle every test below applies: a 100 × 100 window whose origin
 *  is (40, 40), so the post-crop canvas is [0, 100] on both axes. */
const CROP = { x: 40, y: 40, width: 100, height: 100 };

const wall = (points: number[], layer = "WALLS"): DxfPrimitive => ({
  kind: "line",
  layer,
  points,
});

/** Named so the assertions below read as outcomes rather than coordinates. */
const PRIMITIVES: Record<string, DxfPrimitive> = {
  // Spans the full canvas width; both endpoints land outside the crop.
  spanning: wall([-20, 100, 220, 100]),
  // Comfortably inside.
  inside: wall([60, 60, 80, 80]),
  // Entirely right of / below the crop.
  beyond: wall([300, 300, 310, 310], "JUNK"),
  // Entirely left of / above the crop.
  before: wall([0, 0, 10, 10], "JUNK"),
  // Lands exactly on the far corner once shifted — (140, 140) → (100, 100).
  onEdge: {
    kind: "text",
    layer: "LABELS",
    text: "A1",
    x: 140,
    y: 140,
    height: 4,
    rotation: 0,
  },
};

function floorPlan(): FloorPlanData {
  return {
    version: "1.0",
    id: "test-plan",
    name: "Test Plan",
    dimensions: { width: 200, height: 200, unit: "ft", pixelsPerUnit: 10 },
    elements: [
      {
        id: "booth-1",
        type: "booth",
        geometry: { shape: "rect", x: 50, y: 50, width: 20, height: 20 },
        properties: { color: "#000000", zIndex: 1 },
      },
    ],
    legend: { entries: [], position: "top-left", visible: false },
    background: {
      kind: "dxf",
      url: "blob:test",
      sourceFileName: "plan.dxf",
      primitives: Object.values(PRIMITIVES),
      layers: ["WALLS", "JUNK", "LABELS"],
      hiddenLayers: ["JUNK", "LABELS"],
      bounds: { minX: 0, minY: 0, maxX: 200, maxY: 200 },
      opacity: 1,
    },
    scaleCalibration: {
      p1: { x: 50, y: 50 },
      p2: { x: 150, y: 50 },
      distance: 10,
      unit: "ft",
    },
    metadata: { createdAt: "", updatedAt: "", scale: 1 },
  };
}

function cropped() {
  const hook = renderHook(() => useEditorState(floorPlan()));
  act(() => hook.result.current.applyCrop(CROP));
  return hook;
}

/** Surviving DXF primitives, as flat point arrays for easy comparison. */
function survivors(data: FloorPlanData): DxfPrimitive[] {
  const background = data.background;
  return background?.kind === "dxf" ? background.primitives : [];
}

describe("applyCrop", () => {
  it("keeps geometry whose bounding box intersects the new canvas", () => {
    // ADX-264: the filter is bounding-box intersection, not vertex-inside. A
    // wall crossing the whole canvas has both endpoints cropped away, and
    // testing its vertices would delete the wall the crop was framing.
    const { result } = cropped();
    const kept = survivors(result.current.data);
    expect(kept).toContainEqual(wall([-60, 60, 180, 60]));
    expect(kept).toContainEqual(wall([20, 20, 40, 40]));
  });

  it("drops geometry that falls entirely outside the new canvas", () => {
    const { result } = cropped();
    const kept = survivors(result.current.data);
    // Past the right/bottom edge, and past the left/top edge respectively.
    expect(kept).not.toContainEqual(wall([260, 260, 270, 270], "JUNK"));
    expect(kept).not.toContainEqual(wall([-40, -40, -30, -30], "JUNK"));
    expect(kept).toHaveLength(3);
  });

  it("treats the canvas edge as inside", () => {
    // The comparison is inclusive, so a label sitting exactly on the boundary
    // survives instead of vanishing on a pixel-perfect crop.
    const { result } = cropped();
    expect(survivors(result.current.data)).toContainEqual(
      expect.objectContaining({ kind: "text", x: 100, y: 100 }),
    );
  });

  it("shifts elements, calibration and canvas size by the crop origin", () => {
    const { result } = cropped();
    const { data } = result.current;
    expect(data.elements[0].geometry).toMatchObject({ x: 10, y: 10 });
    expect(data.scaleCalibration).toMatchObject({
      p1: { x: 10, y: 10 },
      p2: { x: 110, y: 10 },
    });
    expect(data.dimensions).toMatchObject({
      width: 100,
      height: 100,
      // Real-world scale is untouched — a crop reframes, it doesn't rescale.
      unit: "ft",
      pixelsPerUnit: 10,
    });
  });

  it("prunes layers that no longer have any geometry", () => {
    const { result } = cropped();
    const background = result.current.data.background;
    if (background?.kind !== "dxf")
      throw new Error("expected a dxf background");
    expect(background.layers).toEqual(["WALLS", "LABELS"]);
    // hiddenLayers is a subset of layers; a stale entry would leave the
    // Properties panel toggling a layer that no longer exists.
    expect(background.hiddenLayers).toEqual(["LABELS"]);
  });

  it("is a single undoable mutation", () => {
    // Destructive by design — dropped primitives only come back via undo.
    const { result } = cropped();
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(survivors(result.current.data)).toHaveLength(5);
    expect(result.current.data.dimensions).toMatchObject({
      width: 200,
      height: 200,
    });
  });
});

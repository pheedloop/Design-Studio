import { describe, it, expect } from "vitest";
import { resolveFeatures } from "@/tiers";
import {
  isNavigationTool,
  isToolAvailable,
  isToolVisible,
  toolFeature,
} from "./toolAvailability";

describe("toolFeature", () => {
  it("gates the image tool behind images, not drawing tools", () => {
    expect(toolFeature("image")).toBe("images");
  });

  it("gates the measure tool behind scaleCalibration", () => {
    expect(toolFeature("measure")).toBe("scaleCalibration");
  });

  it("gates every other drawing tool behind drawingTools", () => {
    for (const id of ["rectangle", "ellipse", "text", "icon", "polygon"]) {
      expect(toolFeature(id)).toBe("drawingTools");
    }
  });

  it("leaves navigation ungated", () => {
    expect(toolFeature("hand")).toBeNull();
    expect(toolFeature("select")).toBeNull();
    expect(isNavigationTool("hand")).toBe(true);
    expect(isNavigationTool("rectangle")).toBe(false);
  });
});

describe("isToolAvailable", () => {
  it("blocks only the image tool when images is locked", () => {
    const features = resolveFeatures("basic", { images: false });
    expect(isToolAvailable("image", features)).toBe(false);
    expect(isToolAvailable("rectangle", features)).toBe(true);
  });

  it("keeps the image tool usable when drawingTools is locked", () => {
    const features = resolveFeatures("basic", { drawingTools: false });
    expect(isToolAvailable("image", features)).toBe(true);
    expect(isToolAvailable("rectangle", features)).toBe(false);
  });

  it("refuses the measure tool below premium, so M cannot reach it either", () => {
    expect(isToolAvailable("measure", resolveFeatures("advanced"))).toBe(false);
    expect(isToolAvailable("measure", resolveFeatures("premium"))).toBe(true);
  });

  it("never blocks navigation, whatever the tier allows", () => {
    const features = resolveFeatures("basic", {
      drawingTools: "hidden",
      images: "hidden",
    });
    expect(isToolAvailable("hand", features)).toBe(true);
    expect(isToolAvailable("select", features)).toBe(true);
  });
});

describe("isToolVisible", () => {
  it("drops the measure tool whenever scale calibration is not enabled", () => {
    for (const tier of ["basic", "advanced"] as const) {
      expect(isToolVisible("measure", resolveFeatures(tier))).toBe(false);
    }
    expect(isToolVisible("measure", resolveFeatures("premium"))).toBe(true);
    expect(
      isToolVisible(
        "measure",
        resolveFeatures("premium", { scaleCalibration: "hidden" }),
      ),
    ).toBe(false);
  });

  it("keeps a locked tool visible when it has no hide opt-out", () => {
    const features = resolveFeatures("basic", { drawingTools: false });
    expect(isToolVisible("rectangle", features)).toBe(true);
    expect(
      isToolVisible(
        "rectangle",
        resolveFeatures("basic", { drawingTools: "hidden" }),
      ),
    ).toBe(false);
  });

  it("defaults to premium, so an embed that passes no tier keeps every tool", () => {
    const features = resolveFeatures();
    for (const id of ["measure", "rectangle", "image"]) {
      expect(isToolVisible(id, features)).toBe(true);
    }
  });
});

import { describe, it, expect } from "vitest";
import { resolveFeatures } from "@/tiers";
import {
  isNavigationTool,
  isToolAvailable,
  toolFeature,
} from "./toolAvailability";

describe("toolFeature", () => {
  it("gates the image tool behind images, not drawing tools", () => {
    expect(toolFeature("image")).toBe("images");
  });

  it("gates every other drawing tool behind drawingTools", () => {
    for (const id of ["rectangle", "ellipse", "text", "icon", "measure"]) {
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

  it("never blocks navigation, whatever the tier allows", () => {
    const features = resolveFeatures("basic", {
      drawingTools: "hidden",
      images: "hidden",
    });
    expect(isToolAvailable("hand", features)).toBe(true);
    expect(isToolAvailable("select", features)).toBe(true);
  });
});

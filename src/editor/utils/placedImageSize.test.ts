import { describe, it, expect } from "vitest";
import {
  placedImageSize,
  PLACED_IMAGE_FALLBACK_EDGE,
  PLACED_IMAGE_MAX_EDGE,
} from "./placedImageSize";

describe("placedImageSize", () => {
  it("keeps an image already within the max edge at its intrinsic size", () => {
    expect(placedImageSize({ width: 120, height: 80 })).toEqual({
      width: 120,
      height: 80,
    });
  });

  it("scales a landscape image down to the max edge", () => {
    expect(placedImageSize({ width: 1920, height: 960 })).toEqual({
      width: PLACED_IMAGE_MAX_EDGE,
      height: PLACED_IMAGE_MAX_EDGE / 2,
    });
  });

  it("scales a portrait image down by its height", () => {
    expect(placedImageSize({ width: 480, height: 960 })).toEqual({
      width: PLACED_IMAGE_MAX_EDGE / 2,
      height: PLACED_IMAGE_MAX_EDGE,
    });
  });

  it("preserves aspect ratio for a non-integer scale", () => {
    const { width, height } = placedImageSize({ width: 1000, height: 333 });
    expect(width).toBe(PLACED_IMAGE_MAX_EDGE);
    expect(height).toBe(80);
  });

  it("never rounds an extreme aspect ratio down to zero", () => {
    expect(placedImageSize({ width: 4000, height: 3 }).height).toBe(1);
  });

  it("falls back to a square when dimensions are unknown", () => {
    expect(placedImageSize({ width: null, height: null })).toEqual({
      width: PLACED_IMAGE_FALLBACK_EDGE,
      height: PLACED_IMAGE_FALLBACK_EDGE,
    });
  });

  it("falls back to a square when only one dimension is known", () => {
    expect(placedImageSize({ width: 200, height: null })).toEqual({
      width: PLACED_IMAGE_FALLBACK_EDGE,
      height: PLACED_IMAGE_FALLBACK_EDGE,
    });
  });

  it("honours an explicit max edge", () => {
    expect(placedImageSize({ width: 400, height: 200 }, 100)).toEqual({
      width: 100,
      height: 50,
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  placedImageSize,
  withMeasuredSize,
  PLACED_IMAGE_FALLBACK_EDGE,
  PLACED_IMAGE_MAX_EDGE,
} from "./placedImageSize";
import type { EditorImage } from "@/editor/types";

function galleryImage(overrides: Partial<EditorImage> = {}): EditorImage {
  return {
    id: "img-1",
    url: "https://example.test/a.png",
    name: "a.png",
    width: null,
    height: null,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

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

describe("withMeasuredSize", () => {
  it("fills in dimensions the host could not supply", () => {
    const result = withMeasuredSize(galleryImage(), {
      "img-1": { width: 800, height: 200 },
    });
    expect(result.width).toBe(800);
    expect(result.height).toBe(200);
  });

  it("keeps the host's dimensions when it supplied them", () => {
    const result = withMeasuredSize(galleryImage({ width: 100, height: 50 }), {
      "img-1": { width: 800, height: 200 },
    });
    expect(result.width).toBe(100);
    expect(result.height).toBe(50);
  });

  it("returns the image untouched when nothing has been measured yet", () => {
    const image = galleryImage();
    expect(withMeasuredSize(image, {})).toBe(image);
  });

  it("ignores a measurement recorded for a different image", () => {
    const result = withMeasuredSize(galleryImage(), {
      "img-2": { width: 800, height: 200 },
    });
    expect(result.width).toBeNull();
  });

  it("places a measured wide image at its real aspect ratio", () => {
    const measured = withMeasuredSize(galleryImage(), {
      "img-1": { width: 1200, height: 300 },
    });
    expect(placedImageSize(measured)).toEqual({
      width: PLACED_IMAGE_MAX_EDGE,
      height: PLACED_IMAGE_MAX_EDGE / 4,
    });
  });
});

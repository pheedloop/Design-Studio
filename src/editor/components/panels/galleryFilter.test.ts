import { describe, it, expect } from "vitest";
import { filterAndSortImages, imageExtension } from "./galleryFilter";
import type { EditorImage } from "@/editor/types";

function image(name: string, createdAt: string, id = name): EditorImage {
  return {
    id,
    name,
    createdAt,
    url: `https://example.test/${name}`,
    width: 10,
    height: 10,
  };
}

const IMAGES: EditorImage[] = [
  image("beta.png", "2026-01-02T00:00:00Z"),
  image("Alpha.svg", "2026-01-03T00:00:00Z"),
  image("gamma.jpg", "2026-01-01T00:00:00Z"),
];

describe("imageExtension", () => {
  it("lowercases the extension", () => {
    expect(imageExtension("Logo.PNG")).toBe("png");
  });

  it("returns empty for a name with no extension", () => {
    expect(imageExtension("logo")).toBe("");
  });

  it("ignores a leading dot on a dotfile", () => {
    expect(imageExtension(".hidden")).toBe("");
  });

  it("takes only the final segment", () => {
    expect(imageExtension("map.v2.final.jpeg")).toBe("jpeg");
  });
});

describe("filterAndSortImages", () => {
  it("sorts newest first by default", () => {
    expect(filterAndSortImages(IMAGES, "", "recent").map(i => i.name)).toEqual([
      "Alpha.svg",
      "beta.png",
      "gamma.jpg",
    ]);
  });

  it("sorts by name", () => {
    expect(filterAndSortImages(IMAGES, "", "name").map(i => i.name)).toEqual([
      "Alpha.svg",
      "beta.png",
      "gamma.jpg",
    ]);
  });

  it("sorts by extension, then name within an extension", () => {
    const sameType = [
      image("zebra.png", "2026-01-01T00:00:00Z"),
      image("apple.png", "2026-01-02T00:00:00Z"),
      image("thing.gif", "2026-01-03T00:00:00Z"),
    ];
    expect(filterAndSortImages(sameType, "", "type").map(i => i.name)).toEqual([
      "thing.gif",
      "apple.png",
      "zebra.png",
    ]);
  });

  it("matches the filename case-insensitively", () => {
    expect(
      filterAndSortImages(IMAGES, "ALPHA", "recent").map(i => i.name),
    ).toEqual(["Alpha.svg"]);
  });

  it("matches a substring anywhere in the filename", () => {
    expect(
      filterAndSortImages(IMAGES, "amm", "recent").map(i => i.name),
    ).toEqual(["gamma.jpg"]);
  });

  it("ignores surrounding whitespace in the query", () => {
    expect(
      filterAndSortImages(IMAGES, "  beta  ", "recent").map(i => i.name),
    ).toEqual(["beta.png"]);
  });

  it("returns nothing when the query matches nothing", () => {
    expect(filterAndSortImages(IMAGES, "nope", "recent")).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const original = [...IMAGES];
    filterAndSortImages(IMAGES, "", "name");
    expect(IMAGES).toEqual(original);
  });
});

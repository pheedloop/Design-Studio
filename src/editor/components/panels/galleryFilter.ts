import type { EditorImage } from "@/editor/types";

export type GallerySort = "recent" | "name" | "type";

export function imageExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function filterAndSortImages(
  images: EditorImage[],
  query: string,
  sort: GallerySort,
  locale?: string,
): EditorImage[] {
  const q = query.trim().toLowerCase();
  const matched = q
    ? images.filter(image => image.name.toLowerCase().includes(q))
    : images;

  const byName = (a: EditorImage, b: EditorImage) =>
    a.name.localeCompare(b.name, locale);

  const sorted = [...matched];
  switch (sort) {
    case "name":
      sorted.sort(byName);
      break;
    case "type":
      sorted.sort(
        (a, b) =>
          imageExtension(a.name).localeCompare(
            imageExtension(b.name),
            locale,
          ) || byName(a, b),
      );
      break;
    case "recent":
      sorted.sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
      );
      break;
  }
  return sorted;
}

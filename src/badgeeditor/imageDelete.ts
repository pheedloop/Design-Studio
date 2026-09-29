import { ImageDeleteError } from "@/editor/components/panels/imageDeleteError";
import type { BadgeDocument } from "./model";

const isPlaced = (doc: BadgeDocument, code: string) =>
  doc.pages.some(page =>
    page.fields.some(field => field.kind === "image" && field.code === code),
  );

/** A save with a deleted image on the badge fails, so refuse the delete first. */
export function refusePlacedImageDelete(
  doc: BadgeDocument,
  onDelete: ((id: string) => Promise<void>) | undefined,
): ((id: string) => Promise<void>) | undefined {
  if (!onDelete) return undefined;
  return async id => {
    if (isPlaced(doc, id)) {
      throw new ImageDeleteError("common.error.imageInUse");
    }
    await onDelete(id);
  };
}

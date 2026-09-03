import type { FloorPlanElement } from "@/types";
import { ELEMENT_TYPE_TO_LAYER } from "@/types";
import { getElementBounds } from "./bounds";

/**
 * Ids of content-layer elements whose bounds intersect another's.
 *
 * Images are decoration rather than something a visitor navigates to, so they
 * are never flagged — a logo laid over a booth is deliberate, not a mistake.
 */
export function findOverlappingElementIds(
  elements: FloorPlanElement[],
): Set<string> {
  const contentEls = elements.filter(
    el =>
      el.type !== "image" &&
      (el.layer ?? ELEMENT_TYPE_TO_LAYER[el.type]) === "content",
  );

  const ids = new Set<string>();
  for (let i = 0; i < contentEls.length; i++) {
    for (let j = i + 1; j < contentEls.length; j++) {
      const a = getElementBounds(contentEls[i]);
      const b = getElementBounds(contentEls[j]);
      if (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
      ) {
        ids.add(contentEls[i].id);
        ids.add(contentEls[j].id);
      }
    }
  }
  return ids;
}

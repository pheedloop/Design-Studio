import type { FloorPlanElement } from "../../types";

/**
 * Build the search-box placeholder from the element types actually present in
 * the map, so it never invites the user to search for a category that isn't
 * there (e.g. no session areas → "Search booths").
 *
 * English-only for now. i18n (translatable + the two-consumer keying model) is
 * a separate planned PR — see .planning/IDEAS-I18N.md. When that lands, the
 * nouns and template here become `t(...)` calls; the presence logic stays.
 */
export function buildSearchPlaceholder(elements: FloorPlanElement[]): string {
  const nouns: string[] = [];
  if (elements.some((el) => el.type === "booth")) nouns.push("booths");
  if (elements.some((el) => el.type === "session_area"))
    nouns.push("session locations");
  if (elements.some((el) => el.type === "meeting_room"))
    nouns.push("meeting rooms");

  if (nouns.length === 0) return "Search";

  let list: string;
  if (nouns.length === 1) {
    list = nouns[0];
  } else if (nouns.length === 2) {
    list = `${nouns[0]} or ${nouns[1]}`;
  } else {
    list = `${nouns.slice(0, -1).join(", ")}, or ${nouns[nouns.length - 1]}`;
  }

  return `Search ${list}`;
}

import type { FloorPlanElement } from "@/types";
import { formatList } from "@/i18n/format";
import type { T } from "@/viewer/i18n";

/**
 * Build the search-box placeholder from the element types actually present in
 * the map, so it never invites the user to search for a category that isn't
 * there (e.g. no session areas → "Search booths").
 *
 * The list grammar comes from Intl rather than one key per combination: three
 * types is 7 combinations and a fourth would be 15, and Intl already knows which
 * locales drop the Oxford comma.
 */
export function buildSearchPlaceholder(
  elements: FloorPlanElement[],
  t: T,
  locale?: string,
): string {
  const nouns: string[] = [];
  if (elements.some(el => el.type === "booth"))
    nouns.push(t("viewer.search.nounBooths"));
  if (elements.some(el => el.type === "session_area"))
    nouns.push(t("viewer.search.nounSessionLocations"));
  if (elements.some(el => el.type === "meeting_room"))
    nouns.push(t("viewer.search.nounMeetingRooms"));

  if (nouns.length === 0) return t("viewer.search.empty");

  return t("viewer.search.placeholder", { list: formatList(nouns, locale) });
}

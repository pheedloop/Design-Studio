import type { T } from "../i18n/types";

/** Heading above the occupant list. Flattened out of a four-way ternary. */
export function occupantHeading(
  t: T,
  state: { loading: boolean; hasOccupants: boolean; locked: boolean },
): string {
  if (state.loading) return t("common.loading");
  if (state.hasOccupants) return t("seatviewer.table.seatedHere");
  if (state.locked) return t("seatviewer.table.locked");
  return t("seatviewer.table.empty");
}

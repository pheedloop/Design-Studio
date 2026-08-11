import type { StringKey, T } from "../i18n";

/** The element types the viewer surfaces to users. */
export type ViewerElementType = "booth" | "session_area" | "meeting_room";

/**
 * Short badge shown beside a search result.
 *
 * Carries a key, not a label — module-level, so the render site calls `t(...)`.
 */
export const TYPE_BADGE: Record<
  ViewerElementType,
  { labelKey: StringKey; className: string }
> = {
  // Booth reuses the full name — unlike the other two it needs no abbreviation.
  booth: { labelKey: "common.type.booth", className: "bg-gray-100 text-gray-500" },
  session_area: {
    labelKey: "viewer.type.sessionShort",
    className: "bg-green-100 text-green-700",
  },
  meeting_room: {
    labelKey: "viewer.type.roomShort",
    className: "bg-orange-100 text-orange-700",
  },
};

/** Full type name, used when an element has no name of its own. */
export const TYPE_NAME: Record<ViewerElementType, StringKey> = {
  booth: "common.type.booth",
  session_area: "viewer.type.sessionArea",
  meeting_room: "common.type.meetingRoom",
};

/**
 * What to show for an element that may have no name.
 *
 * The single source of truth for this fallback, deliberately: it is used both to
 * render a result and to match one while searching. If those two ever disagreed,
 * a user would get hits they cannot see, or see rows they cannot find again.
 *
 * Nothing writes the fallback back into the data — storing it would freeze the
 * text in whatever language was active at the time.
 */
export function displayName(
  entry: { name: string; elementType: ViewerElementType },
  t: T,
): string {
  return entry.name || t(TYPE_NAME[entry.elementType]);
}

/**
 * Display text for a directions endpoint, resolved at render for the same reason
 * as displayName — the location itself is held in state.
 *
 * Booth and exhibitor endpoints are only ever built from an element that has a
 * name (or an exhibitor that does), so their name carries the display text.
 *
 * `point` is in the union because DirectionsLocation declares it, but nothing
 * constructs one, hence the bare "".
 */
export function locationLabel(
  location: {
    name: string;
    type: "booth" | "exhibitor" | "session_area" | "meeting_room" | "point";
  },
  t: T,
): string {
  if (location.name) return location.name;
  if (location.type === "session_area" || location.type === "meeting_room") {
    return t(TYPE_NAME[location.type]);
  }
  return "";
}

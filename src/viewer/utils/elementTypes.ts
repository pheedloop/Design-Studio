import type { StringKey, T } from "../i18n";

export type ViewerElementType = "booth" | "session_area" | "meeting_room";

/** Short badge shown beside a search result. */
export const TYPE_BADGE: Record<
  ViewerElementType,
  { labelKey: StringKey; className: string }
> = {
  booth: { labelKey: "common.type.booth", className: "bg-gray-100 text-gray-500" },
  // "Session Area" shortens to an unambiguous "Session"; "Meeting Room" does not
  // shorten to "Room", which reads as any room in the venue.
  session_area: {
    labelKey: "viewer.type.sessionShort",
    className: "bg-green-100 text-green-700",
  },
  meeting_room: {
    labelKey: "common.type.meetingRoom",
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
 * Shared by rendering and by search matching — if they disagreed, a user would get
 * hits they cannot see. Resolved per render, never written back into the data.
 */
export function displayName(
  entry: { name: string; elementType: ViewerElementType },
  t: T,
): string {
  return entry.name || t(TYPE_NAME[entry.elementType]);
}

/** `point` is declared by DirectionsLocation but never constructed, hence the "". */
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

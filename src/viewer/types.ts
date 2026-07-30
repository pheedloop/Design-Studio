export type ViewerMode = "attendee" | "exhibitor";

export interface Exhibitor {
  id: string;
  name: string;
  boothSlug: string;
  logo?: string;
}

/**
 * MeetingRoom DB record.
 * Note: no dedicated MeetingRoom model currently exists in pikachu — the map
 * references meeting rooms by ID in the GeoJSON but the backend model is not
 * yet implemented. This type is forward-looking, modelled on SessionLocation.
 * id       → string code (e.g. "MTLOC42")
 * name     → room name (unique per event)
 * capacity → max occupancy
 */
export interface MeetingRoom {
  id: string;
  name: string;
  capacity?: number;
}

/**
 * Mirrors the PheedLoop SessionLocation DB record.
 * id    → SessionLocation.id  (integer PK — stringified when used as the map sessionId reference)
 * title → SessionLocation.title  (unique per event)
 */
export interface SessionLocation {
  id: number;
  title: string;
  capacity: number;
}

/**
 * Mirrors the PheedLoop ExhibitorBooth DB record.
 * The map editor references booths by slug — it does not own or create them.
 * slug  → ExhibitorBooth.slug  (EXHBOT... unique identifier)
 * code  → ExhibitorBooth.code  (human-readable booth number/label)
 * area  → ExhibitorBooth.area  (area units — see booth pricing docs)
 */
export interface ExhibitorBooth {
  slug: string;
  code: string;
  area: number;
  color?: string;
}

/**
 * Discriminated union representing any interactive map element.
 * elementId is always element.id (the stable UUID) — used for canvas highlight lookup.
 * Future: add | { type: "poi"; elementId: string } without structural changes.
 */
export type HoveredItem =
  | { type: "booth"; elementId: string; boothSlug: string }
  | { type: "session_area"; elementId: string; sessionId?: string | null }
  | { type: "meeting_room"; elementId: string; meetingRoomId?: string | null };

/**
 * Payload handed to `onLocationClick`. `id` is the referenced DB record —
 * SessionLocation id for a session area, MeetingRoom id for a meeting room —
 * and is null when the element has not been linked to one yet.
 */
export interface LocationClick {
  type: "session_area" | "meeting_room";
  id: string | null;
  elementId: string;
  name: string;
}

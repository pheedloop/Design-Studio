import type { SessionLocation } from "../viewer/types";

/**
 * Sample SessionLocation records mirroring the PheedLoop DB.
 * id    → SessionLocation.id  (integer PK)
 * title → SessionLocation.title  (unique per event)
 *
 * IDs are consistent across maps and with the sample floor plans' element
 * `sessionId` references (see e.g. Exhibition Hall.json) — if two maps
 * reference sessionId: "1", they both refer to the Keynote Stage. Element
 * `sessionId`s are strings, so the id is stringified at the placement layer.
 */
export const sampleSessionLocations: SessionLocation[] = [
  { id: 1, title: "Keynote Stage", capacity: 500 },
  { id: 2, title: "Breakout Room A", capacity: 500 },
  { id: 3, title: "Breakout Room B", capacity: 500 },
  { id: 4, title: "Workshop Theatre", capacity: 500 },
  { id: 5, title: "Workshop Room", capacity: 500 },
  { id: 6, title: "Panel Room", capacity: 500 },
  { id: 7, title: "Innovation Lab", capacity: 500 },
  { id: 8, title: "Networking Lounge", capacity: 500 },
];

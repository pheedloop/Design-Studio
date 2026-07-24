import { useState, useMemo } from "react";
import type { FloorPlanElement } from "../../types";
import type { Exhibitor } from "../types";

export interface SearchResult {
  elementId: string;           // element.id UUID — use as React key and for canvas highlight lookup
  elementType: "booth" | "session_area" | "meeting_room";
  name: string;                // primary display name
  code?: string | null;        // boothCode (EXHBOT...) / meetingRoomId (MEL...) / sessionId (LOCA...)
  exhibitorName?: string | null;
}

export function useSearch(
  elements: FloorPlanElement[],
  exhibitors: Exhibitor[]
) {
  const [query, setQuery] = useState("");

  const exhibitorsByBooth = useMemo(() => {
    const map = new Map<string, Exhibitor>();
    for (const ex of exhibitors) {
      map.set(ex.boothSlug, ex);
    }
    return map;
  }, [exhibitors]);

  // Build searchable entries from all interactive element types
  const allEntries = useMemo(() => {
    const entries: SearchResult[] = [];

    for (const el of elements) {
      if (el.type === "booth" && el.properties.name) {
        const code = el.properties.name;
        const exhibitor = exhibitorsByBooth.get(el.properties.boothSlug ?? "");
        entries.push({
          elementId: el.id,
          elementType: "booth",
          name: code,
          code: el.properties.boothSlug ?? code,
          exhibitorName: exhibitor?.name ?? null,
        } satisfies SearchResult);
      } else if (el.type === "session_area") {
        entries.push({
          elementId: el.id,
          elementType: "session_area",
          name: el.properties.name || "Session Area",
          code: el.properties.sessionId ?? null,
        } satisfies SearchResult);
      } else if (el.type === "meeting_room") {
        entries.push({
          elementId: el.id,
          elementType: "meeting_room",
          name: el.properties.name || "Meeting Room",
          code: el.properties.meetingRoomId ?? null,
        } satisfies SearchResult);
      }
    }

    return entries;
  }, [elements, exhibitorsByBooth]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allEntries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        // code may be a number in real data (session/meeting-room ids) — coerce.
        (entry.code != null && String(entry.code).toLowerCase().includes(q)) ||
        (entry.exhibitorName && entry.exhibitorName.toLowerCase().includes(q))
    );
  }, [query, allEntries]);

  // Set of element IDs that match the search (for canvas highlighting)
  const matchedElementIds = useMemo(
    () => new Set(results.map((r) => r.elementId)),
    [results]
  );

  return {
    query,
    setQuery,
    results,
    matchedElementIds,
    isSearching: query.trim().length > 0,
  };
}

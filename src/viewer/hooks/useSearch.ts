import { useState, useMemo } from "react";
import type { FloorPlanElement } from "../../types";
import type { Exhibitor } from "../types";
import { displayName, type ViewerElementType } from "../utils/elementTypes";
import { useT } from "../i18n";

export interface SearchResult {
  elementId: string; // element.id UUID — use as React key and for canvas highlight lookup
  elementType: ViewerElementType;
  /** The element's own name. May be "" — resolve for display with displayName(). */
  name: string;
  code?: string | null; // boothCode (EXHBOT...) / meetingRoomId (MEL...) / sessionId (LOCA...)
  exhibitorName?: string | null;
}

export function useSearch(
  elements: FloorPlanElement[],
  exhibitors: Exhibitor[],
  options?: { boothsOnly?: boolean },
) {
  const boothsOnly = options?.boothsOnly ?? false;
  const [query, setQuery] = useState("");
  const t = useT();

  const exhibitorsByBooth = useMemo(() => {
    const map = new Map<string, Exhibitor>();
    for (const ex of exhibitors) {
      map.set(ex.boothSlug, ex);
    }
    return map;
  }, [exhibitors]);

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
      } else if (!boothsOnly && el.type === "session_area") {
        entries.push({
          elementId: el.id,
          elementType: "session_area",
          name: el.properties.name || "",
          code: el.properties.sessionId ?? null,
        } satisfies SearchResult);
      } else if (!boothsOnly && el.type === "meeting_room") {
        entries.push({
          elementId: el.id,
          elementType: "meeting_room",
          name: el.properties.name || "",
          code: el.properties.meetingRoomId ?? null,
        } satisfies SearchResult);
      }
    }

    return entries;
  }, [elements, exhibitorsByBooth, boothsOnly]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allEntries.filter(entry => {
      // Match what the user can actually read, so an unnamed room stays findable
      // by its type name — in whatever language it is currently shown in.
      if (displayName(entry, t).toLowerCase().includes(q)) return true;
      if (boothsOnly) return false;
      if (
        entry.exhibitorName &&
        entry.exhibitorName.toLowerCase().includes(q)
      ) {
        return true;
      }
      // Booth `code` is the internal boothSlug (EXHBOT…), never shown to users,
      // so it stays unsearchable; session/meeting-room codes are user-facing.
      return (
        entry.elementType !== "booth" &&
        entry.code != null &&
        String(entry.code).toLowerCase().includes(q)
      );
    });
  }, [query, allEntries, boothsOnly, t]);

  const matchedElementIds = useMemo(
    () => new Set(results.map(r => r.elementId)),
    [results],
  );

  return {
    query,
    setQuery,
    results,
    matchedElementIds,
    isSearching: query.trim().length > 0,
  };
}

import { useState, useMemo, useCallback } from "react";
import type { FloorPlanData } from "../../types";
import type { Exhibitor } from "../types";
import type { SearchResult } from "./useSearch";
import { findPath, smoothPath } from "../utils/pathfinding";
import { displayName } from "../utils/elementTypes";
import { useT } from "../i18n";
import {
  findNearestWalkableCell,
  resolveBoothToCell,
} from "../utils/snapToGrid";

export interface DirectionsLocation {
  type: "booth" | "exhibitor" | "session_area" | "meeting_room" | "point";
  /**
   * The element's own name, may be "". Not a resolved label: these live in state, so
   * a stored label would keep the language it was picked in. See locationLabel().
   */
  name: string;
  /** Booth slug (for booth/exhibitor types) */
  boothSlug?: string;
  /** Element UUID (for session_area / meeting_room / future poi) */
  elementId?: string;
  /** Canvas coordinates (for point type) */
  position?: { x: number; y: number };
}

export type RouteStatus = "idle" | "ready" | "no-route" | "same-location";

export function useDirections(data: FloorPlanData, exhibitors: Exhibitor[]) {
  const t = useT();
  const [active, setActive] = useState(false);
  const [startLocation, setStartLocation] = useState<DirectionsLocation | null>(
    null,
  );
  const [endLocation, setEndLocation] = useState<DirectionsLocation | null>(
    null,
  );

  const grid = data.walkableLayer;
  const hasGrid = !!grid && grid.enabled;

  const exhibitorsByBooth = useMemo(() => {
    const map = new Map<string, Exhibitor>();
    for (const ex of exhibitors) map.set(ex.boothSlug, ex);
    return map;
  }, [exhibitors]);

  const searchEntries = useMemo(() => {
    const entries: SearchResult[] = [];

    for (const el of data.elements) {
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
          name: el.properties.name || "",
          code: el.properties.sessionId ?? null,
        } satisfies SearchResult);
      } else if (el.type === "meeting_room") {
        entries.push({
          elementId: el.id,
          elementType: "meeting_room",
          name: el.properties.name || "",
          code: el.properties.meetingRoomId ?? null,
        } satisfies SearchResult);
      }
    }

    return entries;
  }, [data.elements, exhibitorsByBooth]);

  const searchLocations = useCallback(
    (query: string): SearchResult[] => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return searchEntries.filter(
        entry =>
          displayName(entry, t).toLowerCase().includes(q) ||
          (entry.code && entry.code.toLowerCase().includes(q)) ||
          (entry.exhibitorName &&
            entry.exhibitorName.toLowerCase().includes(q)),
      );
    },
    [searchEntries, t],
  );

  const locationFromResult = useCallback(
    (result: SearchResult): DirectionsLocation => {
      if (result.elementType === "booth") {
        if (result.exhibitorName) {
          return {
            type: "exhibitor",
            name: result.exhibitorName,
            boothSlug: result.code ?? undefined,
            elementId: result.elementId,
          };
        }
        return {
          type: "booth",
          name: result.name,
          boothSlug: result.code ?? undefined,
          elementId: result.elementId,
        };
      }
      return {
        type: result.elementType,
        name: result.name,
        elementId: result.elementId,
      };
    },
    [],
  );

  const { routePath, routeStatus } = useMemo(() => {
    if (!startLocation || !endLocation || !grid || !grid.enabled) {
      return { routePath: null, routeStatus: "idle" as RouteStatus };
    }

    // Check same location — compare by elementId when available, fall back to boothSlug
    const sameById =
      startLocation.elementId &&
      endLocation.elementId &&
      startLocation.elementId === endLocation.elementId;
    const sameByBoothCode =
      !startLocation.elementId &&
      startLocation.boothSlug &&
      endLocation.boothSlug &&
      startLocation.boothSlug === endLocation.boothSlug;
    if (sameById || sameByBoothCode) {
      return { routePath: null, routeStatus: "same-location" as RouteStatus };
    }

    // Resolve to grid cells
    const resolveCell = (loc: DirectionsLocation) => {
      if (loc.type === "point" && loc.position) {
        return findNearestWalkableCell(grid, loc.position.x, loc.position.y);
      }
      // elementId-based lookup (session_area, meeting_room, and booths with elementId)
      if (loc.elementId) {
        const el = data.elements.find(e => e.id === loc.elementId);
        if (el) return resolveBoothToCell(grid, el);
      }
      // Legacy slug-based lookup
      if (loc.boothSlug) {
        const el = data.elements.find(
          e => e.type === "booth" && e.properties.boothSlug === loc.boothSlug,
        );
        if (el) return resolveBoothToCell(grid, el);
      }
      return null;
    };

    const startCell = resolveCell(startLocation);
    const endCell = resolveCell(endLocation);

    if (!startCell || !endCell) {
      return { routePath: null, routeStatus: "no-route" as RouteStatus };
    }

    const path = findPath(grid, startCell, endCell);
    if (!path) {
      return { routePath: null, routeStatus: "no-route" as RouteStatus };
    }

    const smoothed = smoothPath(grid, path);
    return { routePath: smoothed, routeStatus: "ready" as RouteStatus };
  }, [startLocation, endLocation, grid, data.elements]);

  const open = useCallback(() => setActive(true), []);

  const close = useCallback(() => {
    setActive(false);
    setStartLocation(null);
    setEndLocation(null);
  }, []);

  const swap = useCallback(() => {
    setStartLocation(prev => {
      setEndLocation(prev);
      return endLocation;
    });
  }, [endLocation]);

  /** Open directions with a pre-set destination (e.g. from a popover) */
  const navigateTo = useCallback(
    (elementId: string) => {
      const el = data.elements.find(e => e.id === elementId);
      if (!el) return;

      let location: DirectionsLocation;
      if (el.type === "booth" && el.properties.name) {
        const exhibitor = exhibitorsByBooth.get(el.properties.boothSlug ?? "");
        location = {
          type: exhibitor ? "exhibitor" : "booth",
          name: exhibitor?.name || el.properties.name,
          boothSlug: el.properties.boothSlug ?? undefined,
          elementId: el.id,
        };
      } else if (el.type === "session_area") {
        location = {
          type: "session_area",
          name: el.properties.name || "",
          elementId: el.id,
        };
      } else if (el.type === "meeting_room") {
        location = {
          type: "meeting_room",
          name: el.properties.name || "",
          elementId: el.id,
        };
      } else {
        return;
      }

      setEndLocation(location);
      setStartLocation(null);
      setActive(true);
    },
    [exhibitorsByBooth, data.elements],
  );

  return {
    active,
    hasGrid,
    startLocation,
    endLocation,
    routePath,
    routeStatus,
    searchLocations,
    locationFromResult,
    setStartLocation,
    setEndLocation,
    open,
    close,
    swap,
    navigateTo,
  };
}

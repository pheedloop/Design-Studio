import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { PiPath } from "react-icons/pi";
import type { FloorPlanData } from "../types";
import type {
  Exhibitor,
  HoveredItem,
  LocationClick,
  ViewerMode,
} from "./types";
import type { SearchResult } from "./hooks/useSearch";
import { useSearch } from "./hooks/useSearch";
import { buildSearchPlaceholder } from "./utils/searchPlaceholder";
import { useDirections } from "./hooks/useDirections";
import { ViewerCanvas } from "./components/ViewerCanvas";
import { SearchBar } from "./components/SearchBar";
import { MapSidebar } from "./components/MapSidebar";
import { MapSheet } from "./components/MapSheet";
import { BoothPopover } from "./components/BoothPopover";
import { LocationPopover } from "./components/LocationPopover";
import { HoverTooltip } from "./components/HoverTooltip";
import { DirectionsPanel } from "./components/DirectionsPanel";
import { resolveFeatures } from "../tiers";
import type { Tier, FeatureKey, FeatureOverride } from "../tiers";
import { I18nProvider } from "../i18n/context";
import type { Translate } from "../i18n/types";

interface MapViewerProps {
  data: FloorPlanData;
  exhibitors: Exhibitor[];
  mode?: ViewerMode;
  /** Usage-tier preset controlling which features are enabled. Defaults to "premium". */
  tier?: Tier;
  /** Per-feature overrides applied on top of the tier preset. */
  features?: Partial<Record<FeatureKey, FeatureOverride>>;
  /** Called when the user clicks an exhibitor in a booth popover. The host app
   *  typically navigates to that exhibitor's profile page. */
  onExhibitorClick?: (exhibitor: Exhibitor) => void;
  /** Host-driven booth picking: called on booth click instead of opening the internal popover. */
  onBoothClick?: (boothSlug: string, elementId: string) => void;
  /** Host-driven location handling: called on session-area / meeting-room click instead of opening the internal popover. */
  onLocationClick?: (location: LocationClick) => void;
  /** Highlights this booth on mount. */
  initialFocusBoothSlug?: string;
  /** Booths held by the active exhibitor — highlighted and never dimmed. */
  selectedBoothSlugs?: Set<string>;
  /** Booths reserved for another exhibitor — distinct fill. */
  reservedBoothSlugs?: Set<string>;
  /** Host content floated over the map, rendered outside `.pl-map-editor` so host styles win. */
  overlay?: ReactNode;
  /**
   * Resolves the viewer's own UI strings. Omit for built-in English.
   *
   * Keys and their English come from `designStudioStrings`, exported alongside
   * this component. MUST be referentially stable — wrap it in `useCallback`
   * keyed on your language and catalog, since display strings are memoized off
   * its identity. See the README's Internationalization section.
   */
  translate?: Translate;
  /**
   * BCP-47 tag for number and list formatting. Omit for the runtime default.
   *
   * Pass it explicitly wherever the language is not the device's — notably the
   * mobile webview, where `?lang=` on the URL drives the language.
   */
  locale?: string;
}

const MOBILE_BREAKPOINT = 640;

function boothItemForSlug(
  elements: FloorPlanData["elements"],
  boothSlug?: string,
): HoveredItem | null {
  if (!boothSlug) return null;
  const el = elements.find((e) => e.properties.boothSlug === boothSlug);
  return el ? { type: "booth", elementId: el.id, boothSlug } : null;
}

/**
 * Provides the translator, then renders the viewer.
 *
 * The split is required rather than stylistic: a component cannot consume a
 * context it provides in the same render, and the viewer body calls `useT()`
 * indirectly through useSearch/useDirections and the search placeholder.
 */
export function MapViewer({ translate, locale, ...rest }: MapViewerProps) {
  return (
    <I18nProvider translate={translate} locale={locale}>
      <MapViewerInner {...rest} />
    </I18nProvider>
  );
}

function MapViewerInner({
  data,
  exhibitors,
  mode = "attendee",
  tier,
  features,
  onExhibitorClick,
  onBoothClick,
  onLocationClick,
  initialFocusBoothSlug,
  selectedBoothSlugs,
  reservedBoothSlugs,
  overlay,
}: Omit<MapViewerProps, "translate" | "locale">) {
  // Wayfinding (Directions) is gated by the usage tier. The viewer hides the
  // feature entirely when it is not enabled (no disabled/trophy state here).
  const featureMap = useMemo(
    () => resolveFeatures(tier, features),
    [tier, features],
  );
  const wayfindingEnabled = featureMap.wayfinding === "enabled";
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [selectedItem, setSelectedItem] = useState<HoveredItem | null>(() =>
    boothItemForSlug(data.elements, initialFocusBoothSlug),
  );
  const [popover, setPopover] = useState<{
    item: HoveredItem;
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [hover, setHover] = useState<{
    item: HoveredItem;
    name: string;
    x: number;
    y: number;
  } | null>(null);

  const isPicker = mode === "exhibitor";

  const { query, setQuery, results, matchedElementIds, isSearching } =
    useSearch(data.elements, exhibitors, { boothsOnly: isPicker });

  const searchPlaceholder = useMemo(
    () => (isPicker ? "Search booths" : buildSearchPlaceholder(data.elements)),
    [data.elements, isPicker],
  );

  const directions = useDirections(data, exhibitors);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsMobile(width < MOBILE_BREAKPOINT);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const occupiedBoothSlugs = useMemo(
    () => new Set(exhibitors.map((ex) => ex.boothSlug)),
    [exhibitors],
  );

  const exhibitorsByBooth = useMemo(() => {
    const map = new Map<string, Exhibitor>();
    for (const ex of exhibitors) {
      map.set(ex.boothSlug, ex);
    }
    return map;
  }, [exhibitors]);

  const handleSidebarSelect = useCallback((item: HoveredItem) => {
    setSelectedItem((prev) =>
      prev?.elementId === item.elementId ? null : item,
    );
    setPopover(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
    setPopover(null);
  }, []);

  const handleElementClick = useCallback(
    (item: HoveredItem, screenX: number, screenY: number) => {
      if (item.type === "booth" && onBoothClick) {
        // The host owns booth selection, but a highlight left over from a
        // search result would keep every other element dimmed.
        clearSelection();
        onBoothClick(item.boothSlug, item.elementId);
        return;
      }
      if (item.type !== "booth" && onLocationClick) {
        clearSelection();
        const el = data.elements.find((e) => e.id === item.elementId);
        onLocationClick({
          type: item.type,
          id:
            item.type === "session_area"
              ? item.sessionId ?? null
              : item.meetingRoomId ?? null,
          elementId: item.elementId,
          name: el?.properties.name || "",
        });
        return;
      }
      setSelectedItem((prev) =>
        prev?.elementId === item.elementId ? null : item,
      );
      const el = data.elements.find((e) => e.id === item.elementId);
      const name = el?.properties.name || "";
      setPopover((prev) =>
        prev?.item.elementId === item.elementId
          ? null
          : { item, name, x: screenX, y: screenY },
      );
    },
    [data.elements, onBoothClick, onLocationClick, clearSelection],
  );

  const handleResultSelect = useCallback((result: SearchResult) => {
    let item: HoveredItem;
    if (result.elementType === "booth") {
      item = {
        type: "booth",
        elementId: result.elementId,
        boothSlug: result.code!,
      };
    } else if (result.elementType === "session_area") {
      item = {
        type: "session_area",
        elementId: result.elementId,
        sessionId: result.code,
      };
    } else {
      item = {
        type: "meeting_room",
        elementId: result.elementId,
        meetingRoomId: result.code,
      };
    }
    setSelectedItem(item);
    setPopover(null);
  }, []);

  const handlePopoverClose = clearSelection;

  const handleDirectionsStart = useCallback(
    (result: SearchResult | null) => {
      directions.setStartLocation(
        result ? directions.locationFromResult(result) : null,
      );
    },
    [directions],
  );

  const handleDirectionsEnd = useCallback(
    (result: SearchResult | null) => {
      directions.setEndLocation(
        result ? directions.locationFromResult(result) : null,
      );
    },
    [directions],
  );

  const handleGetDirections = useCallback(
    (elementId: string) => {
      directions.navigateTo(elementId);
      setPopover(null);
    },
    [directions],
  );

  const showDirectionsButton =
    wayfindingEnabled &&
    mode === "attendee" &&
    directions.hasGrid &&
    !directions.active;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        className="pl-map-editor flex flex-col h-full relative"
      >
        <div className="flex items-center gap-0 bg-white">
          <div className="flex-1 min-w-0">
            <SearchBar
              query={query}
              results={results}
              placeholder={searchPlaceholder}
              onQueryChange={setQuery}
              onResultSelect={handleResultSelect}
            />
          </div>
          {showDirectionsButton && (
            <button
              onClick={directions.open}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors shrink-0 border-l border-gray-200"
            >
              <PiPath size={16} />
              <span className="hidden sm:inline">Directions</span>
            </button>
          )}
        </div>
        <div className="flex flex-1 overflow-hidden relative">
          <ViewerCanvas
            data={data}
            mode={mode}
            occupiedBoothSlugs={occupiedBoothSlugs}
            selectedBoothSlugs={selectedBoothSlugs}
            reservedBoothSlugs={reservedBoothSlugs}
            highlightedElementId={selectedItem?.elementId ?? null}
            searchMatchIds={isSearching ? matchedElementIds : null}
            routePath={directions.routePath}
            onElementClick={handleElementClick}
            onEmptySpaceClick={clearSelection}
            onElementHover={(item, x, y) => {
              if (!item) {
                setHover(null);
                return;
              }
              const el = data.elements.find((e) => e.id === item.elementId);
              setHover({ item, name: el?.properties.name || "", x, y });
            }}
          />
          {!isMobile && directions.active && (
            <div className="w-64 shrink-0 bg-white border-l border-gray-200 flex flex-col">
              <DirectionsPanel
                startLocation={directions.startLocation}
                endLocation={directions.endLocation}
                routeStatus={directions.routeStatus}
                routePath={directions.routePath}
                dimensions={data.dimensions}
                onSearch={directions.searchLocations}
                onSelectStart={handleDirectionsStart}
                onSelectEnd={handleDirectionsEnd}
                onSwap={directions.swap}
                onClose={directions.close}
              />
            </div>
          )}
          {!isPicker && !isMobile && !directions.active && (
            <MapSidebar
              elements={data.elements}
              exhibitors={exhibitors}
              selectedItem={selectedItem}
              onSelect={handleSidebarSelect}
            />
          )}
          {!isPicker && isMobile && !directions.active && (
            <MapSheet
              elements={data.elements}
              exhibitors={exhibitors}
              selectedItem={selectedItem}
              onSelect={handleSidebarSelect}
            />
          )}
          {isMobile && directions.active && (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50">
              <DirectionsPanel
                startLocation={directions.startLocation}
                endLocation={directions.endLocation}
                routeStatus={directions.routeStatus}
                routePath={directions.routePath}
                dimensions={data.dimensions}
                onSearch={directions.searchLocations}
                onSelectStart={handleDirectionsStart}
                onSelectEnd={handleDirectionsEnd}
                onSwap={directions.swap}
                onClose={directions.close}
              />
            </div>
          )}
          {popover && popover.item.type === "booth" && (
            <BoothPopover
              boothCode={popover.name}
              exhibitor={exhibitorsByBooth.get(popover.item.boothSlug) ?? null}
              x={popover.x}
              y={popover.y}
              onClose={handlePopoverClose}
              onExhibitorClick={onExhibitorClick}
              onGetDirections={
                wayfindingEnabled && mode === "attendee" && directions.hasGrid
                  ? () => handleGetDirections(popover.item.elementId)
                  : undefined
              }
            />
          )}
          {popover && popover.item.type !== "booth" && (
            <LocationPopover
              name={popover.name}
              type={popover.item.type}
              x={popover.x}
              y={popover.y}
              onClose={handlePopoverClose}
              onGetDirections={
                wayfindingEnabled && mode === "attendee" && directions.hasGrid
                  ? () => handleGetDirections(popover.item.elementId)
                  : undefined
              }
            />
          )}
          {hover && !popover && !isMobile && (
            <HoverTooltip
              item={hover.item}
              name={hover.name}
              exhibitor={
                hover.item.type === "booth"
                  ? (exhibitorsByBooth.get(hover.item.boothSlug) ?? null)
                  : null
              }
              reserved={
                hover.item.type === "booth" &&
                !!reservedBoothSlugs?.has(hover.item.boothSlug)
              }
              x={hover.x}
              y={hover.y}
            />
          )}
        </div>
      </div>
      {overlay ? (
        <div style={{ position: "absolute", top: 52, left: 12, zIndex: 30 }}>
          {overlay}
        </div>
      ) : null}
    </div>
  );
}

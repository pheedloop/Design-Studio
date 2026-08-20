import { useState, useRef } from "react";
import {
  PiMagnifyingGlass,
  PiX,
  PiArrowsDownUp,
  PiFootprints,
} from "react-icons/pi";
import type { SearchResult } from "@/viewer/hooks/useSearch";
import type {
  DirectionsLocation,
  RouteStatus,
} from "@/viewer/hooks/useDirections";
import type { Dimensions } from "@/types";
import {
  formatRouteDistance,
  pathDistance,
  pxToReal,
  estimateWalkingTime,
  formatWalkingTime,
} from "@/utils/unitConversion";
import {
  TYPE_BADGE,
  displayName,
  locationLabel,
} from "@/viewer/utils/elementTypes";
import { useLocale, useT } from "@/viewer/i18n";
import type { T } from "@/viewer/i18n";

interface DirectionsPanelProps {
  startLocation: DirectionsLocation | null;
  endLocation: DirectionsLocation | null;
  routeStatus: RouteStatus;
  routePath: { x: number; y: number }[] | null;
  dimensions: Dimensions;
  onSearch: (query: string) => SearchResult[];
  onSelectStart: (result: SearchResult | null) => void;
  onSelectEnd: (result: SearchResult | null) => void;
  onSwap: () => void;
  onClose: () => void;
}

function LocationField({
  label,
  placeholder,
  value,
  onSearch,
  onSelect,
  onClear,
  t,
}: {
  label: string;
  placeholder: string;
  value: DirectionsLocation | null;
  onSearch: (query: string) => SearchResult[];
  onSelect: (result: SearchResult) => void;
  onClear: () => void;
  t: T;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = focused ? onSearch(query) : [];
  const showDropdown = focused && query.trim().length > 0;

  if (value) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-[10px] font-semibold text-gray-400 uppercase w-8 shrink-0">
          {label}
        </span>
        <span className="flex-1 text-xs font-medium text-gray-800 truncate">
          {locationLabel(value, t)}
        </span>
        <button
          onClick={() => {
            onClear();
            setQuery("");
          }}
          className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
        >
          <PiX size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 focus-within:border-blue-400">
        <span className="text-[10px] font-semibold text-gray-400 uppercase w-8 shrink-0">
          {label}
        </span>
        <PiMagnifyingGlass size={12} className="text-gray-300 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className="flex-1 text-xs text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-44 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">
              {t("viewer.search.noResults")}
            </div>
          ) : (
            results.map(result => {
              const badge = TYPE_BADGE[result.elementType];
              return (
                <button
                  key={result.elementId}
                  onClick={() => {
                    onSelect(result);
                    setQuery("");
                    inputRef.current?.blur();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {result.exhibitorName || displayName(result, t)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${badge.className}`}
                    >
                      {t(badge.labelKey)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function DirectionsPanel({
  startLocation,
  endLocation,
  routeStatus,
  routePath,
  dimensions,
  onSearch,
  onSelectStart,
  onSelectEnd,
  onSwap,
  onClose,
}: DirectionsPanelProps) {
  const t = useT();
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">
          {t("viewer.directions.title")}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <PiX size={16} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <LocationField
            label={t("viewer.directions.from")}
            placeholder={t("viewer.directions.fromPlaceholder")}
            t={t}
            value={startLocation}
            onSearch={onSearch}
            onSelect={onSelectStart}
            onClear={() => onSelectStart(null)}
          />
          <LocationField
            label={t("viewer.directions.to")}
            placeholder={t("viewer.directions.toPlaceholder")}
            t={t}
            value={endLocation}
            onSearch={onSearch}
            onSelect={onSelectEnd}
            onClear={() => onSelectEnd(null)}
          />
        </div>

        <button
          onClick={onSwap}
          className="self-center p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
          title={t("viewer.directions.swap")}
        >
          <PiArrowsDownUp size={16} />
        </button>
      </div>

      {routeStatus === "no-route" && (
        <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {t("viewer.directions.noRoute")}
        </div>
      )}
      {routeStatus === "same-location" && (
        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          {t("viewer.directions.sameLocation")}
        </div>
      )}
      {routeStatus === "ready" && routePath && routePath.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          <PiFootprints size={14} className="text-gray-400 shrink-0" />
          <span>{formatRouteDistance(routePath, dimensions, t, locale)}</span>
          {(() => {
            const pxDist = pathDistance(routePath);
            const realDist = pxToReal(pxDist, dimensions.pixelsPerUnit);
            const est = estimateWalkingTime(realDist, dimensions.unit);
            return est ? (
              <span className="text-gray-400">
                &middot; {formatWalkingTime(est, t)}
              </span>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

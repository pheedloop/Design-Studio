import { PiX, PiArrowsDownUp, PiFootprints } from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
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
import { useLocale, useT } from "@/viewer/i18n";
import { LocationField } from "./LocationField";

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
        <IconButton variant="bare" size="sm" onClick={onClose}>
          <PiX size={16} />
        </IconButton>
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

        <IconButton
          size="sm"
          onClick={onSwap}
          className="self-center shrink-0"
          title={t("viewer.directions.swap")}
        >
          <PiArrowsDownUp size={16} />
        </IconButton>
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
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-surface-neutral rounded-lg px-3 py-2">
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
